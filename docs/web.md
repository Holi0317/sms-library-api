# 伺服器模塊

要自動續借? 你找對地方了

## 簡介
當使用者的還書日期只剩下3天時, 就會自動為使用者續借書藉. 預計配合cron(或systemd/timer)使用

## 使用方法
`slh-web main` -- 開始一次的循環. 登入, 查未還的書, 自動續借一手包辦.
`slh-web add` -- 增加使用者到這系統內.
`slh-web migrate` -- 把原來的資料庫轉換成新版的資料庫

## TODO
 - [ ] 增加Google Calendar 的支援, 把還書日期寫到Google Calendar內
 - [ ] 以Django製作網頁介面, 簡化增加使用者的步驟
 - [ ] 增加以json寫成的設定檔
