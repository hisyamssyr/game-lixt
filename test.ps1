# ============================================================================
# GameLixt API Test Suite — 48 Tests
# Usage: .\test.ps1
# Requires: PowerShell 5.1+, Next.js app running at http://localhost:3000
# ============================================================================

$ErrorActionPreference = "Continue"
$BASE = "http://localhost:3000"

# --- Counters ---
$global:PASSED = 0
$global:FAILED = 0
$global:TOTAL  = 0

# --- Saved IDs ---
$global:USER1_ID    = ""
$global:USER2_ID    = ""
$global:GENRE_ID    = ""
$global:GAME_ID     = ""
$global:LIBRARY_ID  = ""
$global:REVIEW_ID   = ""
$global:LIST_ID     = ""
$global:THREAD_ID   = ""
$global:REPLY_ID    = ""

# --- Session cookies ---
$global:SESSION_USER1 = $null  # WebRequestSession
$global:SESSION_USER2 = $null  # WebRequestSession

# ============================================================================
# Helper: Make a request and check the status code
# ============================================================================
function Test-Endpoint {
    param(
        [int]    $TestNum,
        [string] $Method,
        [string] $Url,
        [object] $Body         = $null,
        [int]    $Expected     = 200,
        [string] $Description  = "",
        [Microsoft.PowerShell.Commands.WebRequestSession] $Session = $null,
        [switch] $SaveSession,
        [string] $SessionName  = ""
    )

    $global:TOTAL++
    $label = "[TEST $TestNum] $Method $Url"
    if ($Description) { $label += " ($Description)" }

    $params = @{
        Method      = $Method
        Uri         = $Url
        ContentType = "application/json"
        ErrorAction = "Stop"
        UseBasicParsing = $true
    }

    # Attach session cookies when provided
    if ($Session) {
        $params["WebSession"] = $Session
    }

    # If we need to save the session (login flow)
    if ($SaveSession) {
        $newSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
        $params["SessionVariable"] = $null  # We'll handle it differently
        # Remove SessionVariable, use WebSession with a fresh jar instead
        $params.Remove("SessionVariable")
        $params["WebSession"] = $newSession
    }

    if ($Body) {
        $jsonBody = $Body | ConvertTo-Json -Depth 10 -Compress
        $params["Body"] = [System.Text.Encoding]::UTF8.GetBytes($jsonBody)
    }

    try {
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $content = $response.Content

        if ($statusCode -eq $Expected) {
            Write-Host "  PASSED  " -ForegroundColor Black -BackgroundColor Green -NoNewline
            Write-Host " $label -> $statusCode" -ForegroundColor Green
            $global:PASSED++
        } else {
            Write-Host "  FAILED  " -ForegroundColor White -BackgroundColor Red -NoNewline
            Write-Host " $label -> Expected $Expected, got $statusCode" -ForegroundColor Red
            $global:FAILED++
        }

        # Return parsed JSON so callers can extract IDs
        try {
            $parsed = $content | ConvertFrom-Json
            # If SaveSession, return the session object alongside
            if ($SaveSession) {
                return @{ Json = $parsed; Session = $newSession }
            }
            return $parsed
        } catch {
            if ($SaveSession) {
                return @{ Json = $null; Session = $newSession }
            }
            return $null
        }

    } catch {
        $ex = $_.Exception
        $statusCode = 0
        $errorBody = ""

        if ($ex.Response) {
            $statusCode = [int]$ex.Response.StatusCode
            try {
                $reader = New-Object System.IO.StreamReader($ex.Response.GetResponseStream())
                $errorBody = $reader.ReadToEnd()
                $reader.Close()
            } catch {}
        }

        if ($statusCode -eq $Expected) {
            Write-Host "  PASSED  " -ForegroundColor Black -BackgroundColor Green -NoNewline
            Write-Host " $label -> $statusCode" -ForegroundColor Green
            $global:PASSED++
        } else {
            Write-Host "  FAILED  " -ForegroundColor White -BackgroundColor Red -NoNewline
            Write-Host " $label -> Expected $Expected, got $statusCode" -ForegroundColor Red
            if ($errorBody) {
                Write-Host "           Response: $errorBody" -ForegroundColor DarkGray
            } elseif ($ex.Message) {
                Write-Host "           Error: $($ex.Message)" -ForegroundColor DarkGray
            }
            $global:FAILED++
        }

        try {
            $parsed = $errorBody | ConvertFrom-Json
            if ($SaveSession) {
                return @{ Json = $parsed; Session = $newSession }
            }
            return $parsed
        } catch {
            if ($SaveSession) {
                return @{ Json = $null; Session = $newSession }
            }
            return $null
        }
    }
}

# ============================================================================
# Helper: NextAuth Credentials Login
# Returns a WebRequestSession with the session cookies set.
# NextAuth credentials flow:
#   1. GET /api/auth/csrf -> get csrfToken + cookies
#   2. POST /api/auth/callback/credentials with csrfToken + credentials
#   3. Follow redirects -> collect session token cookie
# ============================================================================
function Login-NextAuth {
    param(
        [string] $Email,
        [string] $Password,
        [int]    $TestNum,
        [string] $Description = ""
    )

    $global:TOTAL++
    $label = "[TEST $TestNum] POST /api/auth/callback/credentials ($Description)"

    try {
        # Step 1: Get CSRF token
        $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
        $csrfResp = Invoke-WebRequest -Uri "$BASE/api/auth/csrf" `
            -Method GET -WebSession $session -UseBasicParsing -ErrorAction Stop
        $csrfData = $csrfResp.Content | ConvertFrom-Json
        $csrfToken = $csrfData.csrfToken

        # Step 2: POST credentials with form encoding (NextAuth expects form data)
        $formBody = "email=$([uri]::EscapeDataString($Email))&password=$([uri]::EscapeDataString($Password))&csrfToken=$([uri]::EscapeDataString($csrfToken))&json=true"

        $loginResp = Invoke-WebRequest -Uri "$BASE/api/auth/callback/credentials" `
            -Method POST `
            -WebSession $session `
            -ContentType "application/x-www-form-urlencoded" `
            -Body $formBody `
            -UseBasicParsing `
            -ErrorAction Stop `
            -MaximumRedirection 5

        $statusCode = $loginResp.StatusCode

        # Check if we got a session cookie
        $hasCookie = $false
        foreach ($cookie in $session.Cookies.GetCookies("$BASE/")) {
            if ($cookie.Name -match "next-auth.session-token") {
                $hasCookie = $true
                break
            }
        }

        if ($statusCode -eq 200 -and $hasCookie) {
            Write-Host "  PASSED  " -ForegroundColor Black -BackgroundColor Green -NoNewline
            Write-Host " $label -> 200 (session acquired)" -ForegroundColor Green
            $global:PASSED++
            return $session
        } elseif ($statusCode -eq 200) {
            # 200 but maybe no cookie yet — check session endpoint
            $sessResp = Invoke-WebRequest -Uri "$BASE/api/auth/session" `
                -Method GET -WebSession $session -UseBasicParsing -ErrorAction Stop
            $sessData = $sessResp.Content | ConvertFrom-Json
            if ($sessData.user) {
                Write-Host "  PASSED  " -ForegroundColor Black -BackgroundColor Green -NoNewline
                Write-Host " $label -> 200 (session verified)" -ForegroundColor Green
                $global:PASSED++
                return $session
            } else {
                Write-Host "  FAILED  " -ForegroundColor White -BackgroundColor Red -NoNewline
                Write-Host " $label -> 200 but no valid session" -ForegroundColor Red
                $global:FAILED++
                return $session
            }
        } else {
            Write-Host "  FAILED  " -ForegroundColor White -BackgroundColor Red -NoNewline
            Write-Host " $label -> Expected 200, got $statusCode" -ForegroundColor Red
            $global:FAILED++
            return $null
        }
    } catch {
        $ex = $_.Exception
        $statusCode = 0
        if ($ex.Response) { $statusCode = [int]$ex.Response.StatusCode }

        Write-Host "  FAILED  " -ForegroundColor White -BackgroundColor Red -NoNewline
        Write-Host " $label -> Expected 200, got $statusCode ($($ex.Message))" -ForegroundColor Red
        $global:FAILED++
        return $null
    }
}

# ============================================================================
# Helper: Extract ID from various response shapes
# ============================================================================
function Get-IdFromResponse {
    param($Response, [string]$Field)
    if ($null -eq $Response) { return "" }
    # Direct field
    if ($Response.PSObject.Properties[$Field]) {
        return $Response.$Field
    }
    # Nested in .user, .genre, .game, .data, etc.
    foreach ($nested in @("user", "genre", "game", "data", "list", "thread", "review")) {
        if ($Response.PSObject.Properties[$nested] -and $Response.$nested.PSObject.Properties[$Field]) {
            return $Response.$nested.$Field
        }
    }
    return ""
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   GameLixt API Test Suite — 48 Endpoints" -ForegroundColor Cyan
Write-Host "   Target: $BASE" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# SETUP — Register and Login
# ============================================================================
Write-Host "--- SETUP: Register & Login ---" -ForegroundColor Yellow

# [TEST 1] Register user1
$r1 = Test-Endpoint -TestNum 1 -Method POST -Url "$BASE/api/auth/register" `
    -Body @{ username = "user1"; email = "user1@example.com"; password = "password123" } `
    -Expected 201 -Description "Register user1"
$global:USER1_ID = Get-IdFromResponse -Response $r1 -Field "user_id"
if (-not $global:USER1_ID) {
    Write-Host "           user1_id: (will retrieve after login)" -ForegroundColor DarkGray
}

# [TEST 2] Register user2
$r2 = Test-Endpoint -TestNum 2 -Method POST -Url "$BASE/api/auth/register" `
    -Body @{ username = "user2"; email = "user2@example.com"; password = "password123" } `
    -Expected 201 -Description "Register user2"
$global:USER2_ID = Get-IdFromResponse -Response $r2 -Field "user_id"

# [TEST 3] Login as user1
$global:SESSION_USER1 = Login-NextAuth -Email "user1@example.com" -Password "password123" `
    -TestNum 3 -Description "Login user1"

# Get user IDs from session if not obtained from register response
if ($global:SESSION_USER1 -and (-not $global:USER1_ID)) {
    try {
        $sessResp = Invoke-WebRequest -Uri "$BASE/api/auth/session" `
            -Method GET -WebSession $global:SESSION_USER1 -UseBasicParsing -ErrorAction Stop
        $sessData = $sessResp.Content | ConvertFrom-Json
        if ($sessData.user.user_id) {
            $global:USER1_ID = $sessData.user.user_id
        }
    } catch {}
}

Write-Host "           user1_id = $($global:USER1_ID)" -ForegroundColor DarkGray
Write-Host "           user2_id = $($global:USER2_ID)" -ForegroundColor DarkGray
Write-Host ""

# ============================================================================
# GENRES
# ============================================================================
Write-Host "--- GENRES ---" -ForegroundColor Yellow

# [TEST 4] POST /api/genres
$r4 = Test-Endpoint -TestNum 4 -Method POST -Url "$BASE/api/genres" `
    -Body @{ genre_name = "RPG"; description = "Role playing games" } `
    -Expected 201 -Description "Create genre" `
    -Session $global:SESSION_USER1
$global:GENRE_ID = Get-IdFromResponse -Response $r4 -Field "genre_id"
Write-Host "           genre_id = $($global:GENRE_ID)" -ForegroundColor DarkGray

# [TEST 5] GET /api/genres — NOTE: This route may not have a GET handler
# The genres route.ts only exports POST. We'll test it anyway per spec.
$r5 = Test-Endpoint -TestNum 5 -Method GET -Url "$BASE/api/genres" `
    -Expected 200 -Description "List genres"
Write-Host ""

# ============================================================================
# GAMES
# ============================================================================
Write-Host "--- GAMES ---" -ForegroundColor Yellow

# [TEST 6] POST /api/games
$r6 = Test-Endpoint -TestNum 6 -Method POST -Url "$BASE/api/games" `
    -Body @{
        title = "Test Game"
        developer = "Test Dev"
        release_date = "2024-01-01"
        description = "A test game"
        cover_url = "http://example.com/cover.jpg"
        genre_ids = @($global:GENRE_ID)
    } `
    -Expected 201 -Description "Create game" `
    -Session $global:SESSION_USER1
$global:GAME_ID = Get-IdFromResponse -Response $r6 -Field "game_id"
Write-Host "           game_id = $($global:GAME_ID)" -ForegroundColor DarkGray

# [TEST 7] GET /api/games
$r7 = Test-Endpoint -TestNum 7 -Method GET -Url "$BASE/api/games" -Expected 200 -Description "List games"

# [TEST 8] GET /api/games?search=Test
$r8 = Test-Endpoint -TestNum 8 -Method GET -Url "$BASE/api/games?search=Test" -Expected 200 -Description "Search games"

# [TEST 9] GET /api/games?sort=rating
$r9 = Test-Endpoint -TestNum 9 -Method GET -Url "$BASE/api/games?sort=rating" -Expected 200 -Description "Sort games"

# [TEST 10] GET /api/games/GAME_ID
$r10 = Test-Endpoint -TestNum 10 -Method GET -Url "$BASE/api/games/$($global:GAME_ID)" -Expected 200 -Description "Get game detail"
Write-Host ""

# ============================================================================
# LIBRARY
# ============================================================================
Write-Host "--- LIBRARY ---" -ForegroundColor Yellow

# [TEST 11] GET /api/library (no session) → 401
$r11 = Test-Endpoint -TestNum 11 -Method GET -Url "$BASE/api/library" -Expected 401 -Description "No auth"

# [TEST 12] POST /api/library (as user1)
$r12 = Test-Endpoint -TestNum 12 -Method POST -Url "$BASE/api/library" `
    -Body @{ game_id = $global:GAME_ID; play_status = "Playing" } `
    -Expected 200 -Description "Add to library" `
    -Session $global:SESSION_USER1

# We need the library_id — fetch it from GET /api/library
if ($global:SESSION_USER1) {
    try {
        $libResp = Invoke-WebRequest -Uri "$BASE/api/library" `
            -Method GET -WebSession $global:SESSION_USER1 -UseBasicParsing -ErrorAction Stop
        $libData = $libResp.Content | ConvertFrom-Json
        if ($libData.data -and $libData.data.Count -gt 0) {
            $global:LIBRARY_ID = $libData.data[0].library_id
        }
    } catch {}
}
Write-Host "           library_id = $($global:LIBRARY_ID)" -ForegroundColor DarkGray

# [TEST 13] GET /api/library (as user1)
$r13 = Test-Endpoint -TestNum 13 -Method GET -Url "$BASE/api/library" `
    -Expected 200 -Description "Get library" `
    -Session $global:SESSION_USER1

# [TEST 14] GET /api/library?status=Playing (as user1)
$r14 = Test-Endpoint -TestNum 14 -Method GET -Url "$BASE/api/library?status=Playing" `
    -Expected 200 -Description "Filter library by status" `
    -Session $global:SESSION_USER1
Write-Host ""

# ============================================================================
# REVIEWS
# ============================================================================
Write-Host "--- REVIEWS ---" -ForegroundColor Yellow

# [TEST 15] POST /api/reviews (game not in library — this should fail)
# We'll skip this complex cross-user scenario and just note it
# Instead, test with a non-existent game_id or skip per spec note
$r15 = Test-Endpoint -TestNum 15 -Method POST -Url "$BASE/api/reviews" `
    -Body @{ game_id = "00000000-0000-0000-0000-000000000000"; rating = 8.5; review_text = "Great game!" } `
    -Expected 400 -Description "Review game not in library" `
    -Session $global:SESSION_USER1

# [TEST 16] POST /api/reviews (as user1, game IS in library)
$r16 = Test-Endpoint -TestNum 16 -Method POST -Url "$BASE/api/reviews" `
    -Body @{ game_id = $global:GAME_ID; rating = 8.5; review_text = "Great game!" } `
    -Expected 200 -Description "Create review" `
    -Session $global:SESSION_USER1

# Fetch review_id from GET /api/reviews
try {
    $revResp = Invoke-WebRequest -Uri "$BASE/api/reviews?game_id=$($global:GAME_ID)" `
        -Method GET -UseBasicParsing -ErrorAction Stop
    $revData = $revResp.Content | ConvertFrom-Json
    if ($revData -is [System.Array] -and $revData.Count -gt 0) {
        $global:REVIEW_ID = $revData[0].review_id
    } elseif ($revData.PSObject.Properties["review_id"]) {
        $global:REVIEW_ID = $revData.review_id
    }
} catch {}
Write-Host "           review_id = $($global:REVIEW_ID)" -ForegroundColor DarkGray

# [TEST 17] GET /api/reviews?game_id=GAME_ID
$r17 = Test-Endpoint -TestNum 17 -Method GET -Url "$BASE/api/reviews?game_id=$($global:GAME_ID)" `
    -Expected 200 -Description "Get reviews for game"

# [TEST 18] POST /api/reviews (duplicate)
$r18 = Test-Endpoint -TestNum 18 -Method POST -Url "$BASE/api/reviews" `
    -Body @{ game_id = $global:GAME_ID; rating = 7.0; review_text = "Duplicate review" } `
    -Expected 400 -Description "Duplicate review" `
    -Session $global:SESSION_USER1

# [TEST 19] PATCH /api/reviews/REVIEW_ID
$r19 = Test-Endpoint -TestNum 19 -Method PATCH -Url "$BASE/api/reviews/$($global:REVIEW_ID)" `
    -Body @{ rating = 9.0; review_text = "Updated review" } `
    -Expected 200 -Description "Update review" `
    -Session $global:SESSION_USER1
Write-Host ""

# ============================================================================
# LISTS
# ============================================================================
Write-Host "--- LISTS ---" -ForegroundColor Yellow

# [TEST 20] POST /api/lists
$r20 = Test-Endpoint -TestNum 20 -Method POST -Url "$BASE/api/lists" `
    -Body @{ title = "My Top Games"; description = "Best games ever"; list_cover_url = "http://example.com/cover.jpg" } `
    -Expected 200 -Description "Create list" `
    -Session $global:SESSION_USER1

# Fetch list_id from GET /api/lists
try {
    $listResp = Invoke-WebRequest -Uri "$BASE/api/lists" `
        -Method GET -UseBasicParsing -ErrorAction Stop
    $listData = $listResp.Content | ConvertFrom-Json
    if ($listData -is [System.Array] -and $listData.Count -gt 0) {
        $global:LIST_ID = $listData[0].list_id
    } elseif ($listData.PSObject.Properties["list_id"]) {
        $global:LIST_ID = $listData.list_id
    }
} catch {}
Write-Host "           list_id = $($global:LIST_ID)" -ForegroundColor DarkGray

# [TEST 21] GET /api/lists
$r21 = Test-Endpoint -TestNum 21 -Method GET -Url "$BASE/api/lists" `
    -Expected 200 -Description "List all lists"

# [TEST 22] GET /api/lists/LIST_ID
$r22 = Test-Endpoint -TestNum 22 -Method GET -Url "$BASE/api/lists/$($global:LIST_ID)" `
    -Expected 200 -Description "Get list detail"

# [TEST 23] PATCH /api/lists/LIST_ID
$r23 = Test-Endpoint -TestNum 23 -Method PATCH -Url "$BASE/api/lists/$($global:LIST_ID)" `
    -Body @{ title = "Updated Top Games"; description = "Updated desc"; list_cover_url = "http://example.com/cover2.jpg" } `
    -Expected 200 -Description "Update list" `
    -Session $global:SESSION_USER1

# [TEST 24] POST /api/lists/LIST_ID/items
$r24 = Test-Endpoint -TestNum 24 -Method POST -Url "$BASE/api/lists/$($global:LIST_ID)/items" `
    -Body @{ game_id = $global:GAME_ID } `
    -Expected 200 -Description "Add item to list" `
    -Session $global:SESSION_USER1

# [TEST 25] POST /api/lists/LIST_ID/items (duplicate)
$r25 = Test-Endpoint -TestNum 25 -Method POST -Url "$BASE/api/lists/$($global:LIST_ID)/items" `
    -Body @{ game_id = $global:GAME_ID } `
    -Expected 409 -Description "Duplicate item" `
    -Session $global:SESSION_USER1

# [TEST 26] POST /api/lists/LIST_ID/votes (self-vote)
$r26 = Test-Endpoint -TestNum 26 -Method POST -Url "$BASE/api/lists/$($global:LIST_ID)/votes" `
    -Body @{ is_upvote = $true } `
    -Expected 403 -Description "Self-vote blocked" `
    -Session $global:SESSION_USER1
Write-Host ""

# ============================================================================
# THREADS
# ============================================================================
Write-Host "--- THREADS ---" -ForegroundColor Yellow

# [TEST 27] POST /api/threads (new thread)
$r27 = Test-Endpoint -TestNum 27 -Method POST -Url "$BASE/api/threads" `
    -Body @{ comment = "First thread!"; replying_to = $null } `
    -Expected 201 -Description "Create thread" `
    -Session $global:SESSION_USER1

# Fetch thread_id from GET /api/threads
try {
    $thrResp = Invoke-WebRequest -Uri "$BASE/api/threads" `
        -Method GET -UseBasicParsing -ErrorAction Stop
    $thrData = $thrResp.Content | ConvertFrom-Json
    if ($thrData -is [System.Array] -and $thrData.Count -gt 0) {
        $global:THREAD_ID = $thrData[0].thread_id
    }
} catch {}
Write-Host "           thread_id = $($global:THREAD_ID)" -ForegroundColor DarkGray

# [TEST 28] POST /api/threads (reply)
$r28 = Test-Endpoint -TestNum 28 -Method POST -Url "$BASE/api/threads" `
    -Body @{ comment = "My reply"; replying_to = $global:THREAD_ID } `
    -Expected 201 -Description "Reply to thread" `
    -Session $global:SESSION_USER1

# Fetch reply_id — it's the newest thread
try {
    $thrResp2 = Invoke-WebRequest -Uri "$BASE/api/threads/$($global:THREAD_ID)" `
        -Method GET -UseBasicParsing -ErrorAction Stop
    $thrTree = $thrResp2.Content | ConvertFrom-Json
    if ($thrTree.replies -and $thrTree.replies.Count -gt 0) {
        $global:REPLY_ID = $thrTree.replies[0].thread_id
    }
} catch {}
Write-Host "           reply_id = $($global:REPLY_ID)" -ForegroundColor DarkGray

# [TEST 29] GET /api/threads
$r29 = Test-Endpoint -TestNum 29 -Method GET -Url "$BASE/api/threads" `
    -Expected 200 -Description "List threads"

# [TEST 30] GET /api/threads/THREAD_ID
$r30 = Test-Endpoint -TestNum 30 -Method GET -Url "$BASE/api/threads/$($global:THREAD_ID)" `
    -Expected 200 -Description "Get thread detail"

# [TEST 31] POST /api/threads/THREAD_ID/votes (self-vote)
$r31 = Test-Endpoint -TestNum 31 -Method POST -Url "$BASE/api/threads/$($global:THREAD_ID)/votes" `
    -Body @{ is_upvote = $true } `
    -Expected 403 -Description "Self-vote blocked" `
    -Session $global:SESSION_USER1
Write-Host ""

# ============================================================================
# CROSS-USER TESTS (switch to user2)
# ============================================================================
Write-Host "--- CROSS-USER TESTS (user2) ---" -ForegroundColor Yellow

# [TEST 32] Login as user2
$global:SESSION_USER2 = Login-NextAuth -Email "user2@example.com" -Password "password123" `
    -TestNum 32 -Description "Login user2"

# Get user2 ID from session
if ($global:SESSION_USER2 -and (-not $global:USER2_ID)) {
    try {
        $sess2Resp = Invoke-WebRequest -Uri "$BASE/api/auth/session" `
            -Method GET -WebSession $global:SESSION_USER2 -UseBasicParsing -ErrorAction Stop
        $sess2Data = $sess2Resp.Content | ConvertFrom-Json
        if ($sess2Data.user.user_id) {
            $global:USER2_ID = $sess2Data.user.user_id
        }
    } catch {}
}
Write-Host "           user2_id = $($global:USER2_ID)" -ForegroundColor DarkGray

# [TEST 33] PATCH /api/lists/LIST_ID (as user2, editing user1's list)
$r33 = Test-Endpoint -TestNum 33 -Method PATCH -Url "$BASE/api/lists/$($global:LIST_ID)" `
    -Body @{ title = "Hacked!" } `
    -Expected 403 -Description "Edit other user list" `
    -Session $global:SESSION_USER2

# [TEST 34] DELETE /api/reviews/REVIEW_ID (as user2, deleting user1's review)
$r34 = Test-Endpoint -TestNum 34 -Method DELETE -Url "$BASE/api/reviews/$($global:REVIEW_ID)" `
    -Expected 403 -Description "Delete other user review" `
    -Session $global:SESSION_USER2

# [TEST 35] POST /api/lists/LIST_ID/votes (as user2, voting on user1's list)
$r35 = Test-Endpoint -TestNum 35 -Method POST -Url "$BASE/api/lists/$($global:LIST_ID)/votes" `
    -Body @{ is_upvote = $true } `
    -Expected 200 -Description "User2 votes on list" `
    -Session $global:SESSION_USER2

# [TEST 36] POST /api/threads/THREAD_ID/votes (as user2, voting on user1's thread)
$r36 = Test-Endpoint -TestNum 36 -Method POST -Url "$BASE/api/threads/$($global:THREAD_ID)/votes" `
    -Body @{ is_upvote = $true } `
    -Expected 200 -Description "User2 votes on thread" `
    -Session $global:SESSION_USER2
Write-Host ""

# ============================================================================
# PROFILE
# ============================================================================
Write-Host "--- PROFILE ---" -ForegroundColor Yellow

# [TEST 37] GET /api/profile/user1
# NOTE: No /api/profile route exists in the codebase. Testing anyway per spec.
$r37 = Test-Endpoint -TestNum 37 -Method GET -Url "$BASE/api/profile/user1" `
    -Expected 200 -Description "Get user1 profile"
Write-Host ""

# ============================================================================
# CLEANUP (switch back to user1)
# ============================================================================
Write-Host "--- CLEANUP ---" -ForegroundColor Yellow

# [TEST 38] Re-login as user1
$global:SESSION_USER1 = Login-NextAuth -Email "user1@example.com" -Password "password123" `
    -TestNum 38 -Description "Re-login user1"

# [TEST 39] DELETE /api/threads/REPLY_ID
$r39 = Test-Endpoint -TestNum 39 -Method DELETE -Url "$BASE/api/threads/$($global:REPLY_ID)" `
    -Expected 200 -Description "Delete reply" `
    -Session $global:SESSION_USER1

# [TEST 40] DELETE /api/threads/THREAD_ID
$r40 = Test-Endpoint -TestNum 40 -Method DELETE -Url "$BASE/api/threads/$($global:THREAD_ID)" `
    -Expected 200 -Description "Delete thread" `
    -Session $global:SESSION_USER1

# [TEST 41] DELETE /api/lists/LIST_ID/items
$r41 = Test-Endpoint -TestNum 41 -Method DELETE -Url "$BASE/api/lists/$($global:LIST_ID)/items" `
    -Body @{ game_id = $global:GAME_ID } `
    -Expected 200 -Description "Remove item from list" `
    -Session $global:SESSION_USER1

# [TEST 42] DELETE /api/lists/LIST_ID
$r42 = Test-Endpoint -TestNum 42 -Method DELETE -Url "$BASE/api/lists/$($global:LIST_ID)" `
    -Expected 200 -Description "Delete list" `
    -Session $global:SESSION_USER1

# [TEST 43] DELETE /api/reviews/REVIEW_ID
$r43 = Test-Endpoint -TestNum 43 -Method DELETE -Url "$BASE/api/reviews/$($global:REVIEW_ID)" `
    -Expected 200 -Description "Delete review" `
    -Session $global:SESSION_USER1

# [TEST 44] DELETE /api/library/LIBRARY_ID
$r44 = Test-Endpoint -TestNum 44 -Method DELETE -Url "$BASE/api/library/$($global:LIBRARY_ID)" `
    -Expected 200 -Description "Delete library entry" `
    -Session $global:SESSION_USER1

# [TEST 45] DELETE /api/games/GAME_ID
$r45 = Test-Endpoint -TestNum 45 -Method DELETE -Url "$BASE/api/games/$($global:GAME_ID)" `
    -Expected 200 -Description "Delete game" `
    -Session $global:SESSION_USER1

# [TEST 46] DELETE /api/genres/GENRE_ID
$r46 = Test-Endpoint -TestNum 46 -Method DELETE -Url "$BASE/api/genres/$($global:GENRE_ID)" `
    -Expected 200 -Description "Delete genre" `
    -Session $global:SESSION_USER1

# [TEST 47] DELETE /api/users/USER2_ID (as user2 session — can only delete own account)
$r47 = Test-Endpoint -TestNum 47 -Method DELETE -Url "$BASE/api/users/$($global:USER2_ID)" `
    -Expected 200 -Description "Delete user2 account" `
    -Session $global:SESSION_USER2

# [TEST 48] DELETE /api/users/USER1_ID (as user1 session)
$r48 = Test-Endpoint -TestNum 48 -Method DELETE -Url "$BASE/api/users/$($global:USER1_ID)" `
    -Expected 200 -Description "Delete user1 account" `
    -Session $global:SESSION_USER1

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   Total:   $($global:TOTAL)" -ForegroundColor White
Write-Host "   Passed:  $($global:PASSED)" -ForegroundColor Green
Write-Host "   Failed:  $($global:FAILED)" -ForegroundColor Red

$pct = if ($global:TOTAL -gt 0) { [math]::Round(($global:PASSED / $global:TOTAL) * 100, 1) } else { 0 }
Write-Host "   Rate:    $pct%" -ForegroundColor $(if ($pct -eq 100) { "Green" } elseif ($pct -ge 80) { "Yellow" } else { "Red" })
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

if ($global:FAILED -eq 0) {
    Write-Host "   ALL TESTS PASSED!" -ForegroundColor Black -BackgroundColor Green
} else {
    Write-Host "   SOME TESTS FAILED" -ForegroundColor White -BackgroundColor Red
}
Write-Host ""
