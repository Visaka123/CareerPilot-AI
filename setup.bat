@echo off
echo ============================================
echo  CareerPilot AI - Setup Script
echo ============================================
echo.

REM Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found. Please install Java 17+
    echo Download: https://adoptium.net/
    pause
    exit /b 1
)
echo [OK] Java found

REM Check if Maven is installed
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Maven not found. Installing via winget...
    winget install Apache.Maven --silent
    if %errorlevel% neq 0 (
        echo [WARN] winget install failed. Please install Maven manually:
        echo Download: https://maven.apache.org/download.cgi
        echo Add to PATH: C:\Program Files\Maven\bin
        echo.
        echo Alternatively, use the Maven wrapper (mvnw):
        echo   cd backend ^&^& mvnw spring-boot:run
    )
) else (
    echo [OK] Maven found
)

REM Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

REM Check MySQL
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] MySQL CLI not found in PATH. Make sure MySQL 8.0+ is running.
) else (
    echo [OK] MySQL found
)

echo.
echo ============================================
echo  Starting CareerPilot AI
echo ============================================
echo.
echo Step 1: Setting up database...
echo Run: mysql -u root -p ^< database\schema.sql
echo.
echo Step 2: Configure backend environment
echo Copy backend\.env.example to backend\.env and fill in your values
echo.
echo Step 3: Start backend (in a new terminal):
echo   cd backend
echo   mvn spring-boot:run
echo   (or: mvnw spring-boot:run)
echo.
echo Step 4: Start frontend (in another terminal):
echo   cd frontend
echo   npm install
echo   npm run dev
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080
echo.
echo Demo credentials:
echo   User:  demo@careerpilot.ai / demo123
echo   Admin: admin@careerpilot.ai / demo123
echo.
pause
