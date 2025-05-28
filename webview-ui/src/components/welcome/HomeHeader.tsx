import CaretLogoVariable from "@/assets/CaretLogoVariable"
import HeroTooltip from "@/components/common/HeroTooltip"

const HomeHeader = () => {
	return (
		<div className="flex flex-col items-center mb-5">
			<div className="my-5">
				<CaretLogoVariable className="size-16" />
			</div>
			<div className="text-center flex items-center justify-center">
				<h2 className="m-0 text-[var(--vscode-font-size)]">{"캐럿 제로에 오신 것을 환영합니다!"}</h2>
				<HeroTooltip
					placement="bottom"
					className="max-w-[300px]"
					content={
						"다양한 프로그래밍 언어와 프레임워크를 지원하며, 코드 작성, 분석, 디버깅, 리팩토링을 도와드릴 수 있어요. 일반 프로그래밍 질문이나 AI 개발에 대한 도움도 드릴 수 있어요!"
					}>
					<span
						className="codicon codicon-info ml-2 cursor-pointer"
						style={{ fontSize: "14px", color: "var(--vscode-textLink-foreground)" }}
					/>
				</HeroTooltip>
			</div>
		</div>
	)
}

export default HomeHeader
