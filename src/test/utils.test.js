import {
    traverseTreeNodes,
    formatSourceNodes,
    getDraggingNodesKey,
} from '../tree/utils';

import customSourceNodes from './customData';

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
});
