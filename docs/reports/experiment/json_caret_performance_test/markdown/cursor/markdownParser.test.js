// markdownParser.test.js
// 마크다운 변환 로직을 테스트하는 코드

// markdownParser.js에서 export한 함수를 import
const { parseMarkdown } = require("./markdownParser.js")

// 테스트 유틸리티 함수: HTML 문자열을 정규화
function normalizeHTML(html) {
	return html.replace(/\s+/g, " ").trim()
}

// 제목 변환 테스트
describe("헤더 변환 테스트", () => {
	test("H1 변환", () => {
		expect(parseMarkdown("# 제목1")).toBe("<h1>제목1</h1>")
	})

	test("H2 변환", () => {
		expect(parseMarkdown("## 제목2")).toBe("<h2>제목2</h2>")
	})

	test("H3 변환", () => {
		expect(parseMarkdown("### 제목3")).toBe("<h3>제목3</h3>")
	})

	test("H4 변환", () => {
		expect(parseMarkdown("#### 제목4")).toBe("<h4>제목4</h4>")
	})

	test("H5 변환", () => {
		expect(parseMarkdown("##### 제목5")).toBe("<h5>제목5</h5>")
	})

	test("H6 변환", () => {
		expect(parseMarkdown("###### 제목6")).toBe("<h6>제목6</h6>")
	})

	test("여러 줄의 헤더", () => {
		const markdown = "# 제목1\n## 제목2"
		const expected = "<h1>제목1</h1>\n<h2>제목2</h2>"
		expect(parseMarkdown(markdown)).toBe(expected)
	})
})

// 텍스트 강조 테스트
describe("텍스트 강조 테스트", () => {
	test("이탤릭 변환", () => {
		expect(parseMarkdown("*이탤릭*")).toBe("<em>이탤릭</em>")
	})

	test("볼드 변환", () => {
		expect(parseMarkdown("**볼드**")).toBe("<strong>볼드</strong>")
	})

	test("볼드 이탤릭 변환", () => {
		expect(parseMarkdown("***볼드 이탤릭***")).toBe("<strong><em>볼드 이탤릭</em></strong>")
	})

	test("문장 내 강조 변환", () => {
		const markdown = "이것은 *이탤릭*이고, 이것은 **볼드**입니다."
		const expected = "이것은 <em>이탤릭</em>이고, 이것은 <strong>볼드</strong>입니다."
		expect(parseMarkdown(markdown)).toBe(expected)
	})
})

// 목록 변환 테스트
describe("목록 변환 테스트", () => {
	test("순서 없는 목록 변환 (하이픈)", () => {
		const markdown = "- 항목1\n- 항목2\n- 항목3"
		const expected = "<ul><li>항목1</li><li>항목2</li><li>항목3</li></ul>"
		expect(normalizeHTML(parseMarkdown(markdown))).toBe(normalizeHTML(expected))
	})

	test("순서 없는 목록 변환 (별표)", () => {
		const markdown = "* 항목1\n* 항목2\n* 항목3"
		const expected = "<ul><li>항목1</li><li>항목2</li><li>항목3</li></ul>"
		expect(normalizeHTML(parseMarkdown(markdown))).toBe(normalizeHTML(expected))
	})

	test("순서 있는 목록 변환", () => {
		const markdown = "1. 항목1\n2. 항목2\n3. 항목3"
		const expected = "<ol><li>항목1</li><li>항목2</li><li>항목3</li></ol>"
		expect(normalizeHTML(parseMarkdown(markdown))).toBe(normalizeHTML(expected))
	})
})

// 인용구 변환 테스트
describe("인용구 변환 테스트", () => {
	test("기본 인용구 변환", () => {
		expect(parseMarkdown("> 인용문")).toBe("<blockquote>인용문</blockquote>")
	})

	test("여러 줄 인용구 변환", () => {
		const markdown = "> 첫 번째 줄\n> 두 번째 줄"
		const expected = "<blockquote>첫 번째 줄\n두 번째 줄</blockquote>"
		expect(normalizeHTML(parseMarkdown(markdown))).toBe(normalizeHTML(expected))
	})
})

// 코드 변환 테스트
describe("코드 변환 테스트", () => {
	test("인라인 코드 변환", () => {
		expect(parseMarkdown("`코드`")).toBe("<code>코드</code>")
	})

	test("코드 블록 변환", () => {
		const markdown = "```\n코드 블록\n```"
		const expected = "<pre><code>코드 블록</code></pre>"
		expect(normalizeHTML(parseMarkdown(markdown))).toBe(normalizeHTML(expected))
	})
})

// 링크 변환 테스트
describe("링크 변환 테스트", () => {
	test("기본 링크 변환", () => {
		const markdown = "[링크 텍스트](https://example.com)"
		const expected = '<a href="https://example.com">링크 텍스트</a>'
		expect(parseMarkdown(markdown)).toBe(expected)
	})
})

// 수평선 변환 테스트
describe("수평선 변환 테스트", () => {
	test("하이픈 수평선 변환", () => {
		expect(parseMarkdown("---")).toBe("<hr>")
	})

	test("별표 수평선 변환", () => {
		expect(parseMarkdown("***")).toBe("<hr>")
	})

	test("밑줄 수평선 변환", () => {
		expect(parseMarkdown("___")).toBe("<hr>")
	})
})

// 복합 테스트
describe("복합 문법 테스트", () => {
	test("다양한 요소가 포함된 마크다운 변환", () => {
		const markdown = `# 마크다운 테스트
    
## 부제목

이것은 *이탤릭*이고, 이것은 **볼드**입니다.

- 목록 항목 1
- 목록 항목 2
- 목록 항목 3

> 인용문입니다.

\`\`\`
console.log('Hello world');
\`\`\`

[구글 바로가기](https://google.com)

---`

		const expected = `<h1>마크다운 테스트</h1>
<h2>부제목</h2>
<p>이것은 <em>이탤릭</em>이고, 이것은 <strong>볼드</strong>입니다.</p>
<ul><li>목록 항목 1</li><li>목록 항목 2</li><li>목록 항목 3</li></ul>
<blockquote>인용문입니다.</blockquote>
<pre><code>console.log('Hello world');</code></pre>
<p><a href="https://google.com">구글 바로가기</a></p>
<hr>`

		expect(normalizeHTML(parseMarkdown(markdown))).toBe(normalizeHTML(expected))
	})
})
