// markdown-parser.js
// 마크다운을 HTML로 변환하는 로직

/**
 * 마크다운 텍스트를 HTML로 변환합니다.
 * @param {string} markdown - 변환할 마크다운 텍스트
 * @return {string} 변환된 HTML
 */
function markdownToHtml(markdown) {
	if (!markdown) return ""

	let html = markdown

	// 줄바꿈 처리를 위해 개행 문자 통일
	html = html.replace(/\r\n/g, "\n")

	// 코드 블록 처리 (다른 변환보다 먼저 처리해야 함)
	html = html.replace(/```([^`]+)```/g, function (match, code) {
		return `<pre><code>${code.trim()}</code></pre>`
	})

	// 헤더 처리 (h1 ~ h6)
	html = html.replace(/^###### (.*$)/gm, "<h6>$1</h6>")
	html = html.replace(/^##### (.*$)/gm, "<h5>$1</h5>")
	html = html.replace(/^#### (.*$)/gm, "<h4>$1</h4>")
	html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>")
	html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>")
	html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>")

	// 수평선 처리
	html = html.replace(/^(---|\*\*\*|___)$/gm, "<hr>")

	// 강조 처리
	html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
	html = html.replace(/__(.*?)__/g, "<strong>$1</strong>")
	html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")
	html = html.replace(/_(.*?)_/g, "<em>$1</em>")
	html = html.replace(/~~(.*?)~~/g, "<del>$1</del>")

	// 인라인 코드 처리
	html = html.replace(/`([^`]+)`/g, "<code>$1</code>")

	// 이미지 처리
	html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')

	// 링크 처리
	html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')

	// 인용구 처리
	html = html.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")

	// 순서 없는 목록 처리
	let isInUnorderedList = false
	let unorderedListHtml = ""

	html = html
		.split("\n")
		.map((line) => {
			if (line.match(/^[*\-+] (.*)$/)) {
				const content = line.replace(/^[*\-+] (.*)$/, "$1")

				if (!isInUnorderedList) {
					isInUnorderedList = true
					unorderedListHtml = `<ul><li>${content}</li>`
					return null
				} else {
					unorderedListHtml += `<li>${content}</li>`
					return null
				}
			} else if (isInUnorderedList) {
				isInUnorderedList = false
				const listHtml = unorderedListHtml + "</ul>"
				unorderedListHtml = ""
				return listHtml + "\n" + line
			}

			return line
		})
		.filter((line) => line !== null)
		.join("\n")

	// 마지막 목록 처리
	if (isInUnorderedList) {
		html += unorderedListHtml + "</ul>"
	}

	// 순서 있는 목록 처리
	let isInOrderedList = false
	let orderedListHtml = ""

	html = html
		.split("\n")
		.map((line) => {
			if (line.match(/^\d+\. (.*)$/)) {
				const content = line.replace(/^\d+\. (.*)$/, "$1")

				if (!isInOrderedList) {
					isInOrderedList = true
					orderedListHtml = `<ol><li>${content}</li>`
					return null
				} else {
					orderedListHtml += `<li>${content}</li>`
					return null
				}
			} else if (isInOrderedList) {
				isInOrderedList = false
				const listHtml = orderedListHtml + "</ol>"
				orderedListHtml = ""
				return listHtml + "\n" + line
			}

			return line
		})
		.filter((line) => line !== null)
		.join("\n")

	// 마지막 목록 처리
	if (isInOrderedList) {
		html += orderedListHtml + "</ol>"
	}

	// 단락 처리 (빈 줄로 구분된 텍스트를 <p> 태그로 감싸기)
	html = html.replace(/^([^<].*[^>])$/gm, function (match) {
		// 이미 HTML 태그로 감싸진 내용이 아니라면 <p> 태그로 감싸기
		if (!match.trim().startsWith("<") && !match.trim().endsWith(">")) {
			return `<p>${match}</p>`
		}
		return match
	})

	return html
}

// 모듈 내보내기 (브라우저와 Node.js 환경 모두 지원)
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = { markdownToHtml }
}
