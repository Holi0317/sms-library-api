# St. Mark's School unoffical library api

## 聲名
這一個API以python3寫成

這不是一個官方的API

我(holi0317)與聖馬可中學圖書館系統製作公司(CCNet)並沒有任何關係

## 簡介
就是一個令python的腳本可以與圖書館系統作出互動的API

對於熟習urllib和re的人來說, 寫起來也不需幾個小時

簡單一點來說, 就是可以省去幾個小時的API

對使用者: 這玩意對你沒用處

(雖然這readme也不會有太多人來看就是了 = =)

## 需求
python 3 (在python 3.4.2測試環境下可正常運作)

## 用途
 - 登入帳號
 - 取得讀者ID
 - 取得已借的書
 - 續借書

## 參考
主要物件:
 - sms\_library\_api()

以下的表格中, api為sms\_library\_api()

| 方法 | 用途 | 參數 | 例子 |
| ----- |:----:|:----:|:----:|
| login | 登入圖書館系統, 必需在其他動作之前完成 | 帳號, 密碼 | `api.login(sms00000, 12345678)` |
| get\_reader\_id | 取得讀者的編號, 有一些動作需要它 | *無* | `api.get_reader_id()` |
| url\_formatter | 格式化超連結, 把`{lang}`改為使用者的語言, 預計只在內部使用 | `http://www.example.com{lang}` | `api.url_formatter(LINK)` |
| get\_renew | 取得已借的圖書, 格式為[編號, 書名, 借書日期, 還書日期, 繼借次數], 並以list把所有書包著 | *無* | `api.get_renew()` |
| renew | 續借圖書, 每次只能續借一本 | 書的編號 | `api.renew(api.book[0][0])` |

* * *
| 參數 | 內容 | 種類 | 需求 |
| ---- |:------:|:-------:|:-------:|
| api.is\_chinese | 使用者是否使用中文作語言 | bool | api.login |
| api.info | 用戶的個人資料 | dict | api.get\_reader\_id |
| api.book | 已借的書, 格式參考上表 | [[int, str, date, date, int]...] | api.get\_renew |

## TO-DO
 - 令續借書可以一次續借多本
 - 更多功能?

## 已知的bug
去看Issue tracker


