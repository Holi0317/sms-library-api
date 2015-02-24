# Command Line Interface Docutment

## 簡介
整合了圖書館API的一個文字介面

## 使用方法
`slh-cli main` -- 主要的內容. 裏面會有指示
`slh-cli add` -- 把使用者的資料在至 data/account 裏. 下次登入會直接取用那裏的內容. 

## FAQ
 - Q: 為甚麼不是圖形介面?
 - A: 文字介面的使用量比圖形介面多, 熟習它吧 ;D

 - Q: 為甚麼不能無限續借?
 - A: 這是系統的規則, 最多只能續借5次

## 已知的bug
 - 輸出表格的格式會走位. 原因是tabulate計算字數時, 沒有想到非英文字元的寬度, 令寬度過小
