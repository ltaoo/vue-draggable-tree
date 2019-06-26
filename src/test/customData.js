export default [
    {
        key: '0',
        title: '女装',
        children: [
            {
                key: '0-1',
                title: '风衣',
                type: 'clother',
            },
            {
                key: '0-2',
                title: '外套',
                type: 'clother',
            },
        ],
    },
    {
        key: '1',
        title: '男装',
        type: 'clother',
    },
    {
        key: '2',
        title: '图书',
        type: 'book',
        children: [
            {
                key: '2-0',
                title: '小说',
                type: 'book',
                children: [
                    {
                        key: '2-0-0',
                        title: '九州牧云录',
                        type: 'book',
                    },
                    {
                        key: '2-0-1',
                        title: '天空的城',
                        type: 'book',
                    },
                    {
                        key: '2-0-2',
                        title: '三体',
                        type: 'book',
                    },
                ],
            },
            {
                key: '2-1',
                title: '经管',
                type: 'book',
                children: [
                    {
                        key: '2-1-0',
                        title: '创京东',
                        type: 'book',
                    },
                ],
            },
            {
                key: '2-2',
                title: '科技',
                type: 'book',
                children: [
                    {
                        key: '2-2-0',
                        title: 'JavaScript权威指南',
                        highlight: true,
                        type: 'book',
                    },
                    {
                        key: '2-2-1',
                        title: 'JavaScript高级程序设计',
                        type: 'book',
                    },
                ],
            },
        ],
    },
];
