# 目錄
就是所有檔案的所在位置, 功能之類的

## 主程式的結構
.
├── docs    -- 所有文件的位置
│   ├── api.md  -- 有關api的說明
│   ├── backend.md  -- 有關backend的說明
│   ├── README.md   -- 此文件
│   └── web.md  -- 有關web的說明
├── LICENSE -- license 檔案
├── README.md   -- 主要的說明檔案
├── setup.py    -- 安裝檔
├── slh
│   ├── scripts -- 各種自動啟動的script
│   │   ├── slh-server-start    -- 自動啟動的shell腳本
│   │   ├── slh.service -- systemd的unit檔案
│   │   └── slh.timer   -- systemd的timer檔案
│   ├── slhapi.py   -- api
│   └── backend.py    -- backend的執行檔
├── sms\_lib\_helper.egg-info   -- 安裝時出現的檔案, 不用理會
│   ├── dependency\_links.txt
│   ├── entry\_points.txt
│   ├── PKG-INFO
│   ├── requires.txt
│   ├── SOURCES.txt
│   └── top\_level.txt
└── TODO.md -- 未來要做的事

## 資料的結構
在linux下, backend的資料會存在 `~/.slh/` 


~/.slh
├── log -- 紀錄檔的位置
│   └── web.log web所產生的紀錄檔
├── logging.conf    -- logging模塊的設定檔
├── web_data.json   -- 舊版所產生的資料庫
└── web_data.sqlite3    -- 新的資料庫
