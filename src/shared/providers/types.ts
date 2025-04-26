export interface ProviderConfig {
  id: string
  name: string
  defaultModel: string
  fields: {
    apiKey?: {
      label: string
      placeholder: string
      helpText: string
      helpLink?: string
    }
    baseUrl?: {
      label: string
      placeholder: string
      defaultUrl: string
      helpText?: string
    }
    secretKey?: {
      label: string
      placeholder: string
      helpText: string
    }
    region?: {
      label: string
      placeholder: string
      helpText: string
      helpLink?: string
    }
    projectId?: {
      label: string
      placeholder: string
      helpText: string
    }
    endpoint?: {
      label: string
      placeholder: string
      defaultUrl: string
      helpText?: string
    }
    customUrl?: {
      label: string
      placeholder: string
      helpText: string
      helpLink?: string
    }
  }
  validation?: {
    apiKey?: RegExp
    baseUrl?: RegExp
    region?: string[]
  }
  features?: {
    supportsPromptCache?: boolean
    supportsImages?: boolean
    supportsComputerUse?: boolean
  }
} 