@ECHO OFF

REM spooky.email windows dev environment startup script
REM 	opens two command prompts to the main directory, the sublime text
REM 	project, starts the node server, and opens local www dev root in a
REM		browser window
REM		calls config.bat, which sets variables used during startup

CALL config.bat

START cmd.exe /K "cd %dev_root%"
START cmd.exe /K "cd %dev_root% && npm start"
START "" /d %sublime_text_root% sublime_text.exe %sublime_text_proj%
START explorer.exe "%dev_root%"
START "" /d %browser_root% "%local_www_root%"
