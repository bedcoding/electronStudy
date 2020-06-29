// 렌더러 프로세서: UI 관장
// 메인 프로세서: 데이터 관장
// 메인 프로세서에서 샘플 데이터를 만들어서 렌더러 프로세서로 보내는 작업을 먼저 진행
const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const request = require('superagent');
const getTitle = require('get-title');

const data = [
    {
        type: 'home',
        url: 'https://github.com',
        title: '타이틀1'
    },

    {
        type: 'github',
        url: 'https://github.com',
        title: '타이틀2'
    },

    {
        type: 'github',
        url: 'https://github.com',
        title: '타이틀3'
    },
];


app.on('ready', () => {

    // 창의 크기
    const win = new BrowserWindow({
        width: 400,
        height: 400,
        acceptFirstMouse: true,
        titleBarStyle: "hidden",  // 기본 타이틀 밑에 내가 넣은 타이틀 2개가 동시에 뜨는거 막음
        show: false,  // 1. ready-to-show 이벤트가 발생하려면 브라우저 윈도우를 최초 실행시 끄지 않도록 옵션 설정

        // 이거 넣은 이유: index.html에서 "Uncaught ReferenceError: require is not defined"라는 오류가 발생해서 왜 require를 인식 못하는지 구글링해보니 넣으라고 함
        // 참고: https://qastack.kr/programming/19059580/client-on-node-uncaught-referenceerror-require-is-not-defined
        webPreferences: {
            nodeIntegration: true
        }
    });

    // 로드할 파일 (index.html가 없으면 안되)
    win.loadURL(`file://${__dirname}/index.html`);

    // 2. 샘플 데이터를 ready-to-show 이벤트를 통해 렌더러 프로세서로 보내기: 최초 1번만 실행되므로 on이 아니라 once로 실행
    win.once('ready-to-show', () => {
        win.show();                             // 3. ready-to-show 이벤트가 불리면 다시 윈도우가 show 될 수 있도록 처리
        win.webContents.send('update', data);   // 4. index.html에 데이터 보내기
    });

    // Ctrl + V로 주소를 붙여넣기하는 경우 처리하는 구간
    ipcMain.on('paste', (event, item) => {        
        // npm i superagent get-title -S
        // url이 http인지 https인지 확인 -> 프로토콜이 둘 다 아니면 다이얼로그로 경고 띄움
        if(item.url.indexOf('http://') > -1 || item.url.indexOf('https://') > -1) {
            const type = item.type;
            const url = item.url;

            request.get(url)
                .end((err, response) => {
                    const contents = response.res.text;
                    getTitle(contents).then(title => {
                        data.push({type, url, title})          // title과 앞에서 얻어온 type, url을 넣어줌
                        win.webContents.send('update', data);  // 새로 추가된 데이터를 다시 렌더러 프로세서로 넘겨준다.
                    });
                });
        }

        else {
            dialog.showErrorBox('경고', '유효한 url이 아님');
        }
    })


    
});