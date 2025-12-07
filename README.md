🌐 다언(DAEON) – 개인 번역 애플리케이션

다언(DAEON)은 Gemini 및 DeepL API 기반 개인 번역 애플리케이션입니다.
번역 기능, 태그 기반 기록 저장, TTS 기능을 제공하며, 서버에서 API Key를 안전하게 관리합니다.


📌 주요 기능
1) 번역 기능

Gemini / DeepL 번역 엔진 선택

원문/번역 언어 선택 및 스왑

번역 결과 복사 기능

2) TTS(Text-to-Speech)

원문 듣기

번역문 듣기

3) 태그 기반 번역 기록

SQLite 로컬 DB에 기록 저장

태그 추가

상세 보기, 삭제, 즐겨찾기 기능

4) 서버 상태 점검

서버 연결 상태 확인

Gemini API 상태 확인

DeepL API 상태 확인

사용자 친화적 오류 안내(429, 503 등)


🧱 기술 스택
Client (React Native / Expo)

React Native 0.81

Expo Speech

Expo SQLite

React Navigation

Server (Node.js / Express)

Express.js

Gemini API

DeepL API

dotenv



🚀 실행 방법
1) 서버 실행

cd server

npm install

npm start

2) 클라이언트 실행

cd client

npm install

npx expo start

🔧 클라이언트에서 반드시 수정해야 하는 곳
1) translate.js 서버 주소 변경

src/api/translate.js 안:

const SERVER_BASE_URL = "http://server_ip:3000";

예시:

const SERVER_BASE_URL = "http://192.168.1.9:3000
";

2) SettingsScreen.js 서버 주소 변경

src/ui/screens/SettingsScreen.js 안:

const SERVER_BASE_URL = "http://server_ip:3000";

동일하게 PC IP로 변경해야 정상 동작함.

🔧 서버에서 반드시 수정해야 하는 곳
1) .env (API Key 설정)

GEMINI_API_KEY=your_api_key
DEEPL_API_KEY=your_api_key
PORT=3000


🔒 오류 처리 방식

서버는 내부 오류 메시지를 숨기고 사용자 친화적 한글 메시지로 변환하여 응답한다.

오류 유형	사용자 메시지
Gemini 429	“무료 호출 한도를 초과했습니다.”
503 (서버 불안정)	“잠시 후 다시 시도해주세요.”
네트워크 오류	“서버에 연결할 수 없습니다.”
DeepL 키 오류	“DeepL API Key 설정을 확인해주세요.”
400	“번역할 문장 또는 언어 설정을 확인해주세요.”


📌 향후 개선 기능


자동 언어 감지

DeepL Pro 지원

Gemini → DeepL 자동 fallback

📄 라이선스

MIT License.
