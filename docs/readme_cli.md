# Command Line Interface Docutment

## 簡介
整合了圖書館API的一個文字介面

## 用途
 - 登入
 - 取得已借的書
 - 續借書藉

## 所需軟件
一個作業系統 (建議: GNU/Linux)
Python 3 (必需要3, 有不少的代碼不能在2上執行)
tabulate , 不是必需, 但是沒有了表格會走位. 可用pip安裝

## 常見問題
Q: 為甚麼不是圖形介面?
A: 文字介面的使用量比圖形介面多, 熟習它吧 ;D

Q: 我發現了一個bug, 電腦快要爆炸了, 快點救我!
A: 首先, 冷靜下來. 到右邊的Issue Tracker上發出一個問題
問題要詳細描寫事發的經過, 以及如何重製出那個錯誤

Q: 為甚麼不能無限續借?
A: 這是學校的規則, 最多只能續借5次

Q: 打密碼時沒有出現任何東西?
A: 這是**正常**的現象, 目的是為了防止密碼被他人見到(雖然有方法拿到就是了). 輸入完成成按\<ENTER\>就可以了

## 已知的bug
 - 輸出表格的格式會走位. 原因是tabulate計算字數時, 沒有想到非英文字元的寬度, 令寬度過小