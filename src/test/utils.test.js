import {
    traverseTreeNodes,
    formatSourceNodes,
    getDraggingNodesKey,
    findSourceNodeByKey,
    computeMoveNeededParams,
    insertToBottom,
    insertToTop,
} from '../tree/utils';

import customSourceNodes from './customData';
import { TARGET_POSITION_TYPE } from '../tree/constants';

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
            {
                key: 2,
                title: '服装',
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
            {
                key: 2,
                pos: '1',
                title: '服装',
            },
        ]);
    });

    it('has some spec props', () => {
        const res = formatSourceNodes(customSourceNodes);

        expect(res).toEqual([
            {
                key: '0',
                pos: '0',
                title: '女装',
                children: [
                    {
                        key: '0-1',
                        pos: '0-0',
                        title: '风衣',
                        type: 'clother',
                    },
                    {
                        key: '0-2',
                        pos: '0-1',
                        title: '外套',
                        type: 'clother',
                    },
                ],
            },
            {
                key: '1',
                pos: '1',
                title: '男装',
                type: 'clother',
            },
            {
                key: '2',
                pos: '2',
                title: '图书',
                type: 'book',
                children: [
                    {
                        key: '2-0',
                        pos: '2-0',
                        title: '小说',
                        type: 'book',
                        children: [
                            {
                                key: '2-0-0',
                                pos: '2-0-0',
                                title: '九州牧云录',
                                type: 'book',
                            },
                            {
                                key: '2-0-1',
                                pos: '2-0-1',
                                title: '天空的城',
                                type: 'book',
                            },
                            {
                                key: '2-0-2',
                                pos: '2-0-2',
                                title: '三体',
                                type: 'book',
                            },
                        ],
                    },
                    {
                        key: '2-1',
                        pos: '2-1',
                        title: '经管',
                        type: 'book',
                        children: [
                            {
                                key: '2-1-0',
                                pos: '2-1-0',
                                title: '创京东',
                                type: 'book',
                            },
                        ],
                    },
                    {
                        key: '2-2',
                        pos: '2-2',
                        title: '科技',
                        type: 'book',
                        children: [
                            {
                                key: '2-2-0',
                                pos: '2-2-0',
                                title: 'JavaScript权威指南',
                                highlight: true,
                                type: 'book',
                            },
                            {
                                key: '2-2-1',
                                pos: '2-2-1',
                                title: 'JavaScript高级程序设计',
                                type: 'book',
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    it('traverse tree nodes', () => {
        const mockTreeNode = {
            rckey: '2-2',
            pos: '0-0-0',
            isTreeNode: true,
            title: '科技',
            $children: [
                {
                    rckey: '2-2-0',
                    isTreeNode: true,
                    pos: '0-0-0-0',
                    title: 'JavaScript权威指南',
                },
                {
                    rckey: '2-2-1',
                    isTreeNode: true,
                    pos: '0-0-0-1',
                    title: 'JavaScript高级程序设计',
                },
            ],
        };
        const callback = jest.fn();

        traverseTreeNodes(mockTreeNode.$children, callback);

        expect(callback.mock.calls.length).toBe(2);
        // index
        expect(callback.mock.calls[0][1]).toBe(0);
        expect(callback.mock.calls[0][2]).toBe('0-0-0-0');
        // key
        expect(callback.mock.calls[0][3]).toBe('2-2-0');

        expect(callback.mock.calls[1][1]).toBe(1);
        expect(callback.mock.calls[1][2]).toBe('0-0-0-1');
        expect(callback.mock.calls[1][3]).toBe('2-2-1');
    });

    it('get dragging nodes key', () => {
        const mockTreeNode = {
            rckey: '2-2',
            pos: '0-0-0',
            isTreeNode: true,
            title: '科技',
            $children: [
                {
                    rckey: '2-2-0',
                    isTreeNode: true,
                    pos: '0-0-0-0',
                    title: 'JavaScript权威指南',
                },
                {
                    rckey: '2-2-1',
                    isTreeNode: true,
                    pos: '0-0-0-1',
                    title: 'JavaScript高级程序设计',
                },
            ],
        };

        const res = getDraggingNodesKey(mockTreeNode);

        expect(res).toEqual(['2-2-0', '2-2-1', '2-2']);
    });

    it('find source node by key', () => {
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
            {
                key: 2,
                title: '服装',
            },
        ];
        const callback = jest.fn();

        findSourceNodeByKey(sourceNodes, 101, callback);

        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0]).toMatchObject({
            key: 101,
            title: 'JavaScript权威指南',
        });
        expect(callback.mock.calls[0][1]).toBe(0);
        expect(callback.mock.calls[0][2]).toMatchObject([
            {
                key: 101,
                title: 'JavaScript权威指南',
            },
            {
                key: 102,
                title: 'JavaScript高级程序设计',
            },
        ]);
    });

    describe('compute target action and need to operated source nodes', () => {
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
            {
                key: 2,
                title: '服装',
            },
        ];
        it('inner', () => {
            const res = computeMoveNeededParams(
                sourceNodes,
                102,
                0,
                TARGET_POSITION_TYPE.CONTENT,
            );
            expect(res).toEqual({
                targetSourceNode: {
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
                originSourceNode: {
                    key: 102,
                    title: 'JavaScript高级程序设计',
                },
                originSourceNodeIndex: 1,
                originSourceNodes: [
                    {
                        key: 101,
                        title: 'JavaScript权威指南',
                    },
                    {
                        key: 102,
                        title: 'JavaScript高级程序设计',
                    },
                ],
                targetSourceNodes: undefined,
                targetSourceNodeIndex: undefined,
            });
        });

        it('move to top', () => {
            const res = computeMoveNeededParams(
                sourceNodes,
                102,
                0,
                TARGET_POSITION_TYPE.TOP,
            );
            expect(res).toEqual({
                targetSourceNodes: [
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
                    {
                        key: 2,
                        title: '服装',
                    },
                ],
                targetSourceNodeIndex: 0,
                originSourceNode: {
                    key: 102,
                    title: 'JavaScript高级程序设计',
                },
                originSourceNodeIndex: 1,
                originSourceNodes: [
                    {
                        key: 101,
                        title: 'JavaScript权威指南',
                    },
                    {
                        key: 102,
                        title: 'JavaScript高级程序设计',
                    },
                ],
            });
        });

        it('move to bottom', () => {
            const res = computeMoveNeededParams(
                sourceNodes,
                102,
                0,
                TARGET_POSITION_TYPE.TOP,
            );
            expect(res).toEqual({
                targetSourceNodes: [
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
                    {
                        key: 2,
                        title: '服装',
                    },
                ],
                targetSourceNodeIndex: 0,
                originSourceNode: {
                    key: 102,
                    title: 'JavaScript高级程序设计',
                },
                originSourceNodeIndex: 1,
                originSourceNodes: [
                    {
                        key: 101,
                        title: 'JavaScript权威指南',
                    },
                    {
                        key: 102,
                        title: 'JavaScript高级程序设计',
                    },
                ],
            });
        });
    });

    describe('sample case of move to top', () => {
        it('case 1, same source and move to leftmost', () => {
            const targetSourceNodeIndex = 0;
            const targetSourceNodes = ['a', 'b', 'c', 'd'];
            const originSourceNode = 'd';
            const originSourceNodeIndex = 3;

            const res = insertToTop(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                targetSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['d', 'a', 'b', 'c']);
        });
        it('case 2, same source and rightmost', () => {
            const targetSourceNodeIndex = 3;
            const targetSourceNodes = ['a', 'b', 'c', 'd'];
            const originSourceNode = 'b';
            const originSourceNodeIndex = 1;

            const res = insertToTop(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                targetSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['a', 'c', 'b', 'd']);
        });
        it('case 3, same source and middle', () => {
            const targetSourceNodeIndex = 2;
            const targetSourceNodes = ['a', 'b', 'c', 'd'];
            const originSourceNode = 'a';
            const originSourceNodeIndex = 0;

            const res = insertToTop(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                targetSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['b', 'a', 'c', 'd']);
        });

        it('case 4, different source and left most', () => {
            const targetSourceNodeIndex = 0;
            const targetSourceNodes = ['a', 'b', 'd', 'e'];
            const originSourceNode = 'c';
            const originSourceNodeIndex = 1;
            const originSourceNodes = ['f', 'c'];

            const res = insertToTop(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                originSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['c', 'a', 'b', 'd', 'e']);
            expect(res.originSourceNodes).toEqual(['f']);
        });

        it('case 5, different source and left most', () => {
            const targetSourceNodeIndex = 0;
            const targetSourceNodes = ['a', 'b', 'd', 'e'];
            const originSourceNode = 'c';
            const originSourceNodeIndex = 1;
            const originSourceNodes = ['f', 'c'];

            const res = insertToTop(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                originSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['c', 'a', 'b', 'd', 'e']);
            expect(res.originSourceNodes).toEqual(['f']);
        });
        it('case 6, different source and middle', () => {
            const targetSourceNodeIndex = 1;
            const targetSourceNodes = ['a', 'b', 'd', 'e'];
            const originSourceNode = 'c';
            const originSourceNodeIndex = 1;
            const originSourceNodes = ['f', 'c'];

            const res = insertToTop(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                originSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['a', 'c', 'b', 'd', 'e']);
            expect(res.originSourceNodes).toEqual(['f']);
        });
    });

    describe('sample case of move to bottom', () => {
        it('case 1, same source and leftmost', () => {
            const targetSourceNodeIndex = 0;
            const targetSourceNodes = ['a', 'b', 'c', 'd'];
            const originSourceNode = 'c';
            const originSourceNodeIndex = 2;

            const res = insertToBottom(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                targetSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['a', 'c', 'b', 'd']);
        });

        it('case 2, same source and rightmost', () => {
            const targetSourceNodeIndex = 3;
            const targetSourceNodes = ['a', 'b', 'c', 'd'];
            const originSourceNode = 'a';
            const originSourceNodeIndex = 0;

            const res = insertToBottom(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                targetSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['b', 'c', 'd', 'a']);
        });

        it('case 3, same source and middle', () => {
            const targetSourceNodeIndex = 1;
            const targetSourceNodes = ['a', 'b', 'c', 'd'];
            const originSourceNode = 'a';
            const originSourceNodeIndex = 0;

            const res = insertToBottom(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                targetSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['b', 'a', 'c', 'd']);
        });

        it('case 4, different source and leftmost', () => {
            const targetSourceNodeIndex = 0;
            const targetSourceNodes = ['b', 'c', 'd'];
            const originSourceNode = 'a';
            const originSourceNodeIndex = 1;
            const originSourceNodes = ['e', 'a'];

            const res = insertToBottom(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                originSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['b', 'a', 'c', 'd']);
            expect(res.originSourceNodes).toEqual(['e']);
        });

        it('case 5, different source and rightmost', () => {
            const targetSourceNodeIndex = 2;
            const targetSourceNodes = ['b', 'c', 'd'];
            const originSourceNode = 'a';
            const originSourceNodeIndex = 1;
            const originSourceNodes = ['e', 'a'];

            const res = insertToBottom(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                originSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['b', 'c', 'd', 'a']);
            expect(res.originSourceNodes).toEqual(['e']);
        });

        it('case 6, different source and middle', () => {
            const targetSourceNodeIndex = 1;
            const targetSourceNodes = ['b', 'c', 'd'];
            const originSourceNode = 'a';
            const originSourceNodeIndex = 1;
            const originSourceNodes = ['e', 'a'];

            const res = insertToBottom(
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                originSourceNodes,
            );

            expect(res.targetSourceNodes).toEqual(['b', 'c', 'a', 'd']);
            expect(res.originSourceNodes).toEqual(['e']);
        });
    });
});
