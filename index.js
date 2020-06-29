const {app, BrowserWindow} = require('electron');

app.on('ready', () => {

    // 창의 크기
    const win = new BrowserWindow({
        width: 400,
        height: 400,
        acceptFirstMouse: true,
        titleBarStyle: "hidden"  // 기본 타이틀 밑에 내가 넣은 타이틀 2개가 동시에 뜨는거 막음
    });

    // 로드할 파일 (index.html가 없으면 안되)
    win.loadURL(`file://${__dirname}/index.html`);

});