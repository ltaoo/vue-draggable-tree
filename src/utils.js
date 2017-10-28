/**
 * 生成 VNode 组成的数组
 * @param {*} data
 */
export const loop = (data, h, component) => {
    console.log(data, typeof h);
    return data.map((item, i) => {
        if (item.children && item.children.length) {
            return h(component, {
                props: {
                    index: i,
                    rckey: item.key,
                    title: item.key,
                    vChildren: item.children,
                },
            }, loop(item.children, h, component));
        }
        return h(component, {
            props: {
                index: i,
                rckey: item.key,
                title: item.key,
            },
        }, []);
    });
};

export const a = 'b';
