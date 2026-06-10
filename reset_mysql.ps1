net stop MySQL80
Start-Sleep -s 3
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --skip-grant-tables --skip-networking &
Start-Sleep -s 5
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY ''; FLUSH PRIVILEGES;"
Start-Sleep -s 2
Stop-Process -Name "mysqld" -Force
Start-Sleep -s 2
net start MySQL80
