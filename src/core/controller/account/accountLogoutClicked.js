import { Empty } from "../../../shared/proto/common";
/**
 * Handles the account logout action
 * @param controller The controller instance
 * @param _request The empty request object
 * @returns Empty response
 */
export async function accountLogoutClicked(controller, _request) {
    await controller.handleSignOut();
    return Empty.create({});
}
//# sourceMappingURL=accountLogoutClicked.js.map