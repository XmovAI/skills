// Compile-only regression cases for the mistakes corrected in the docs.
import Agent, { type XingyunAvatarAgentOptions, type XingyunAvatarAgentInitParams } from '@xmov/avatar/agent';
// @ts-expect-error This documentation alias is not an SDK export.
import type { AgentServiceConfig } from '@xmov/avatar/agent';
// @ts-expect-error RenderState is not an Agent entrypoint export in the validation package.
import type { RenderState } from '@xmov/avatar/agent';
// @ts-expect-error InitModel is not an Agent entrypoint export in the validation package.
import type { InitModel } from '@xmov/avatar/agent';

declare const agent: Agent;
declare const container: HTMLElement;
// @ts-expect-error container does not make containerId optional in the public type.
const missingId: XingyunAvatarAgentOptions = {
  container, appId: 'id', appSecret: 'placeholder', gatewayServer: 'https://example.test', onMessage() {},
};
// @ts-expect-error Agent speak accepts at most three arguments.
agent.speak('hello', true, true, { emotion: 'happy' });
// @ts-expect-error Agent interrupt has no reason argument.
agent.interrupt('user');
// @ts-expect-error This enum does not accept a plain string literal.
const invalidInit: XingyunAvatarAgentInitParams = { initModel: 'invisible' };
// @ts-expect-error WalkConfig also requires min/max offsets.
agent.changeWalkConfig({ walk_points: { left: 0 } });
// @ts-expect-error Register this callback in constructor options, not on the instance.
agent.onSpeakStateChange = () => {};
// @ts-expect-error Hiding returns a promise, not void.
const hiding: void = agent.switchInvisibleMode();
