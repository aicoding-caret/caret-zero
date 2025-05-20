import { memo } from "react"
<<<<<<< HEAD
import { vscode } from "@/utils/vscode"
=======
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"
>>>>>>> upstream/main

const AccountOptions = () => {
	const handleAccountClick = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	// Call handleAccountClick immediately when component mounts
	handleAccountClick()

	return null // This component doesn't render anything
}

export default memo(AccountOptions)
