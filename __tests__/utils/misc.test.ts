import { isTargetEvent } from '@technote-space/filter-github-action';
import { getContext, testEnv } from '@technote-space/github-action-test-helper';
import { getPayload } from '../../src/utils/misc';
import { TARGET_EVENTS } from '../../src/constant';

describe('isTargetEvent', () => {
	testEnv();

	it('should return true 1', () => {
		expect(isTargetEvent(TARGET_EVENTS, getContext({
			payload: {
				action: 'opened',
			},
			eventName: 'pull_request',
		}))).toBe(true);
	});

	it('should return true 2', () => {
		process.env.INPUT_IGNORE_CONTEXT_CHECK = 'true';
		expect(isTargetEvent(TARGET_EVENTS, getContext({
			payload: {
				action: 'opened',
			},
			eventName: 'push',
		}))).toBe(true);
	});

	it('should return false 1', () => {
		expect(isTargetEvent(TARGET_EVENTS, getContext({
			payload: {
				action: 'opened',
			},
			eventName: 'push',
		}))).toBe(false);
	});

	it('should return false 2', () => {
		expect(isTargetEvent(TARGET_EVENTS, getContext({
			payload: {
				action: 'closed',
			},
			eventName: 'pull_request',
		}))).toBe(false);
	});
});

describe('getPayload', () => {
	it('should get payload', () => {
		expect(getPayload(getContext({
			payload: {
				'test': 123,
			},
		}))).toEqual({
			'test': 123,
		});
	});
});
