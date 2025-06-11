// AbstractController를 Caret 레이어에서 재정의 (완전 독립적)
import * as vscode from "vscode"
import { ExtensionMessage } from "../../../src/shared/ExtensionMessage"
import { WebviewMessage } from "../../../src/shared/WebviewMessage"

export abstract class CaretController {
  constructor(
    protected context: vscode.ExtensionContext,
    protected postMessage: (message: any) => Promise<void>
  ) {}
  
  abstract canHandle(messageType: string): boolean
  abstract handleMessage(message: WebviewMessage): Promise<boolean>

  protected log(message: string): void {
    console.log(`[${this.constructor.name}] ${message}`)
  }

  protected error(message: string, error?: any): void {
    console.error(`[${this.constructor.name}] ${message}`, error)
  }
} 