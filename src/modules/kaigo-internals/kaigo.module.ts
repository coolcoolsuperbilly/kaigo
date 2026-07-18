import { Module } from '@nitrostack/core';
import { KaigoTools } from './kaigo.tools.js';
import { KaigoResources } from './kaigo.resources.js';
import { KaigoPrompts } from './kaigo.prompts.js';

@Module({
  name: 'kaigo',
  description: 'Seamless Financial Manager',
  controllers: [KaigoTools, KaigoResources, KaigoPrompts]
})
export class KaigoModule { }

