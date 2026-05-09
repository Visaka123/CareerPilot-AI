@REM Maven Wrapper for Windows
@REM Usage: mvnw.cmd spring-boot:run

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __ MVNW_CMD__=%MAVEN_WRAPPER_JAR%
@SET MAVEN_WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar

@IF EXIST "%MAVEN_WRAPPER_JAR%" GOTO execute

@SET DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
@ECHO Downloading Maven Wrapper from %DOWNLOAD_URL%
@powershell -Command "&{[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%MAVEN_WRAPPER_JAR%')}"

:execute
@SET JAVA_EXE=%JAVA_HOME%\bin\java.exe
@IF NOT EXIST "%JAVA_EXE%" SET JAVA_EXE=java

@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain
@SET WRAPPER_PROPERTIES=%~dp0.mvn\wrapper\maven-wrapper.properties

"%JAVA_EXE%" ^
  -classpath "%MAVEN_WRAPPER_JAR%" ^
  "-Dmaven.multiModuleProjectDirectory=%~dp0" ^
  %WRAPPER_LAUNCHER% %*
