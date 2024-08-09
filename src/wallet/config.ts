import { ConfigurableModuleBuilder } from '@nestjs/common'

export interface IBaseModuleOptions {
	mode?: string
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<IBaseModuleOptions>().build()
