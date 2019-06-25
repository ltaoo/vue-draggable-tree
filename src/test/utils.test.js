import { traverseTreeNodes, formatSourceNodes } from '../tree/utils';

describe('util function', () => {
    it('add extra props to source node', () => {
        const sourceNodes = [
            {
                key: 0,
                title: '图书',
                children: [
                    {
                        key: 10,
                        title: '科技',
                        children: [
                            {
                                key: 101,
                                title: 'JavaScript权威指南',
                            },
                            {
                                key: 102,
                                title: 'JavaScript高级程序设计',
                            },
                        ],
                    },
                ],
            },
        ];

        const res = formatSourceNodes(sourceNodes);

        expect(res).toEqual([
            {
                key: 0,
                pos: '0',
                title: '图书',
                children: [
                    {
                        key: 10,
                        pos: '0-0',
                        title: '科技',
                        children: [
                            {
                                key: 101,
                                pos: '0-0-0',
                                title: 'JavaScript权威指南',
                            },
                            {
                                key: 102,
                                pos: '0-0-1',
                                title: 'JavaScript高级程序设计',
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    it('traverse tree nodes', () => {
        const mockTreeNodes = [{
            rckey: '2-2',
            pos: '0-0-0',
            title: '科技',
            $children: [
                {
                    rckey: '2-2-0',
                    pos: '0-0-0-0',
                    title: 'JavaScript权威指南',
                },
                {
                    rckey: '2-2-1',
                    pos: '0-0-0-1',
                    title: 'JavaScript高级程序设计',
                },
            ],
        }];
        const callback = jest.fn();

        traverseTreeNodes(mockTreeNodes, callback);

        expect(callback.mock.calls.length).toBe(2);
        // index
        expect(callback.mock.calls[0][1]).toBe(1);
        // key
        expect(callback.mock.calls[0][3]).toBe('2-2-0');
        expect(callback.mock.calls[1][3]).toBe('2-2-1');
        expect(callback.mock.calls[1][1]).toBe(2);
    });
});
