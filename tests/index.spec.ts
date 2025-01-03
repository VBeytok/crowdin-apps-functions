import * as jwt from 'jsonwebtoken';
import { constructCrowdinIdFromJwtPayload, getProjectId, parseCrowdinId, JwtPayload, validateJwtToken } from '../src';

describe('Token-based functions', () => {
    const jwtPayload: JwtPayload = {
        aud: 'test',
        sub: '3',
        iat: 1,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        context: {
            organization_id: 1,
            project_id: 2,
            user_id: 3,
        },
    };

    it('constructCrowdinIdFromJwtPayload', () => {
        const jwtPayload2: JwtPayload = {
            aud: 'test',
            sub: '4',
            iat: 1,
            exp: 1,
            context: {
                organization_id: 1,
                project_id: 2,
                user_id: 4,
            },
        };
        const jwtPayload3: JwtPayload = {
            aud: 'test',
            sub: '3',
            iat: 1,
            exp: 1,
            context: {
                organization_id: 2,
                project_id: 2,
                user_id: 3,
            },
        };
        const id1 = constructCrowdinIdFromJwtPayload(jwtPayload);
        const id2 = constructCrowdinIdFromJwtPayload(jwtPayload2);
        const id3 = constructCrowdinIdFromJwtPayload(jwtPayload3);
        expect(id1).toBeDefined();
        expect(id1 !== id2).toBeTruthy();
        expect(id2 !== id3).toBeTruthy();
        expect(id1 !== id3).toBeTruthy();
    });

    it('validateJwtToken', async () => {
        const secret1 = 'secret1';
        const secret2 = 'secret2';
        const jwtToken = jwt.sign(jwtPayload, secret1);
        const payload = await validateJwtToken(jwtToken, secret1);
        expect(payload).toStrictEqual(jwtPayload);
        await expect(validateJwtToken(jwtToken, secret2)).rejects.toThrow();
    });

    it('getProjectId', () => {
        const crowdinId = constructCrowdinIdFromJwtPayload(jwtPayload);
        const projectId = getProjectId(crowdinId);
        expect(projectId).toStrictEqual(jwtPayload.context.project_id);
    });

    it('parseCrowdinId', () => {
        const crowdinId = constructCrowdinIdFromJwtPayload(jwtPayload);
        const { organization, projectId, userId } = parseCrowdinId(crowdinId);
        expect(+organization).toStrictEqual(jwtPayload.context.organization_id);
        expect(projectId).toStrictEqual(jwtPayload.context.project_id);
        expect(userId).toStrictEqual(jwtPayload.context.user_id);
    });
});
