const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; // 서버 포트, 클라이언트와 겹치지 않게

// 테스트용 데이터
const MOCK_API_KEY = 'test-api-key-12345';
const MOCK_USER_ID = 'mock-firebase-uid';
const MOCK_GENERATION_ID_PREFIX = 'cmpl-mock-';

app.use(cors()); // 모든 도메인에서의 요청을 허용 (개발용)
app.use(express.json()); // JSON 요청 본문 파싱

// API 키 검증 미들웨어
const authenticateApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Authorization header is missing or improperly formatted.' } });
  }
  const apiKey = authHeader.split(' ')[1];
  if (apiKey !== MOCK_API_KEY) {
    return res.status(403).json({ error: { message: 'Invalid API key.' } });
  }
  req.userId = MOCK_USER_ID; // 요청 객체에 사용자 ID 추가 (테스트용)
  next();
};

// --- 인증 관련 엔드포인트 ---
// 가짜 Firebase 로그인: 성공 시 테스트 API 키 반환
app.post('/auth/firebase-login', (req, res) => {
  // 실제로는 req.body.firebaseIdToken 등을 검증해야 함
  console.log('[/auth/firebase-login] Mock login attempt:', req.body);
  res.json({
    message: 'Mock login successful',
    apiKey: MOCK_API_KEY,
    userId: MOCK_USER_ID,
  });
});

// --- /v1 엔드포인트 ---
// 챗 completions (스트리밍)
app.post('/v1/chat/completions', authenticateApiKey, async (req, res) => {
  console.log('[/v1/chat/completions] Request body:', JSON.stringify(req.body, null, 2));
  const { stream, messages } = req.body;
  const model = req.body.model || 'mock-gpt-model';
  const generationId = MOCK_GENERATION_ID_PREFIX + Date.now();

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // 즉시 헤더 전송

    const mockResponseChunks = [
      "Hello! ",
      "This is a mock streaming response ",
      "from api.caret.team. ",
      "The last message was: '",
      messages && messages.length > 0 ? messages[messages.length - 1].content : "No message found.",
      "'. ",
      "Have a great day! ✨"
    ];

    let chunkIndex = 0;
    const intervalId = setInterval(() => {
      if (chunkIndex < mockResponseChunks.length) {
        const chunkData = {
          id: generationId,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [{
            index: 0,
            delta: { content: mockResponseChunks[chunkIndex] },
            finish_reason: null
          }]
        };
        res.write(`data: ${JSON.stringify(chunkData)}\n\n`);
        chunkIndex++;
      } else {
        // 스트림 종료 및 사용량 정보 전송
        const usageChunkData = {
          id: generationId,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [{
            index: 0,
            delta: {},
            finish_reason: "stop"
          }],
          usage: { // 가짜 사용량 정보
            prompt_tokens: 50,
            completion_tokens: 100,
            total_tokens: 150,
            cost: 0 // MVP에서는 비용 0으로
          }
        };
        res.write(`data: ${JSON.stringify(usageChunkData)}\n\n`);
        res.write(`data: [DONE]\n\n`);
        clearInterval(intervalId);
        res.end();
        console.log('[/v1/chat/completions] Mock stream ended.');
      }
    }, 200); // 0.2초 간격으로 청크 전송

    req.on('close', () => {
      clearInterval(intervalId);
      console.log('[/v1/chat/completions] Client disconnected, stream stopped.');
      res.end();
    });

  } else {
    // Non-streaming (MVP에서는 스트리밍만 집중해도 괜찮음)
    res.json({
      id: generationId,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: "This is a mock non-streaming response."
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
        cost: 0
      }
    });
  }
});

// 생성 정보 조회 (사용량)
app.get('/v1/generation', authenticateApiKey, (req, res) => {
  const generationId = req.query.id;
  console.log('[/v1/generation] Request for id:', generationId);

  if (!generationId || !generationId.startsWith(MOCK_GENERATION_ID_PREFIX)) {
    return res.status(404).json({ error: { message: 'Generation not found or invalid ID.'} });
  }

  // CaretHandler가 기대하는 응답 형식에 맞춤
  res.json({
    id: generationId,
    // name: "Mock Generation", // CaretHandler는 이 필드를 사용하지 않음
    // status: "completed", // CaretHandler는 이 필드를 사용하지 않음
    // tokens_prompt: 50, // CaretHandler는 native_tokens_prompt 사용
    // tokens_completion: 100, // CaretHandler는 native_tokens_completion 사용
    native_tokens_prompt: 55, // 약간 다른 값으로 테스트
    native_tokens_completion: 110,
    // cost: 0, // CaretHandler는 total_cost 사용
    total_cost: 0, // MVP에서는 비용 0
    // model: "mock-gpt-model", // CaretHandler는 이 필드를 사용하지 않음
    // kind: "chat", // CaretHandler는 이 필드를 사용하지 않음
    // created_at: new Date().toISOString() // CaretHandler는 이 필드를 사용하지 않음
  });
});

// (선택적 MVP) 사용자 크레딧 잔액 조회
app.get('/users/me/credits', authenticateApiKey, (req, res) => {
  console.log('[/users/me/credits] Request for user:', req.userId);
  res.json({
    currentBalance: 10.00, // 가짜 크레딧 잔액
    currency: "USD"
  });
});

app.listen(PORT, () => {
  console.log(`Caret Team Mock API Server listening on port ${PORT}`);
  console.log(`Mock API Key: ${MOCK_API_KEY}`);
});
