"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// show ui.html，在manifest里面绑定
figma.showUI(__html__);
figma.ui.resize(325, 500);
// 事件处理器，监听来自插件ui的消息
figma.ui.onmessage = (pluginMessage) => __awaiter(void 0, void 0, void 0, function* () {
    // 加载所有页面的节点树，确保可以查找跨页面的节点
    yield figma.loadAllPagesAsync();
    yield figma.loadFontAsync({ family: 'Rubik', style: 'Regular' });
    // 实现的功能：1、根据用户选择的模式匹配对应的Polka样式，2、把样式放进用户输入的尺寸的矩形内
    // 获取用户输入
    const width = pluginMessage.width;
    const height = pluginMessage.height;
    const size = pluginMessage.size;
    const backgroundColor = pluginMessage.backgroundColor;
    const dotColor = pluginMessage.dotColor;
    // const applyModeState = pluginMessage.applyModeState
    const patternVariant = pluginMessage.patternVariant;
    // 根据模式来生成对应的图案
    // 先 生成矩形
    console.log("not all apply");
    // 创建一个 FrameNode 作为容器，用于放置矩形和圆点
    const frame = figma.createFrame();
    frame.resize(width, height); // 设置 Frame 大小，为要创建的矩形区域
    frame.fills = [{ type: 'SOLID', color: backgroundColor }]; // 背景颜色
    // 在 Frame 中创建一个矩形
    const rect = figma.createRectangle();
    rect.resize(width, height); // 矩形的大小和 Frame 一样
    rect.fills = [{ type: 'SOLID', color: backgroundColor }]; // 矩形颜色bg
    // 设置从属关系
    frame.appendChild(rect);
    figma.currentPage.appendChild(frame);
    // 根据用户选择的pattern生成对应图像
    switch (patternVariant) {
        case "1": // even
            generateEvenPolka(frame, width, height, size, dotColor);
            break;
        case "2": // pumpkin
            generatePumpkinPolka(frame, width, height, size, dotColor);
            break;
        default: // alternate
            generateAlternatePolka(frame, width, height, size, dotColor);
            break;
    }
    // 视觉居中
    const nodes = [];
    nodes.push(rect);
    figma.viewport.scrollAndZoomIntoView(nodes);
    figma.closePlugin();
});
// 生成一大一小的圆点，size为dotSize
function generateAlternatePolka(frame, width, height, size, dotColor) {
    // 设置间隔和起始位置
    const xSpacing = size * 2;
    const ySpacing = size * 2;
    let x = size / 2;
    let y = size / 2;
    let rowCount = 0;
    // 循环生成波尔卡圆点
    while (y + size / 2 <= height) {
        let colCount = 0;
        while (x + size / 2 <= width) {
            // 交替大小的圆点：奇数行和列使用不同大小
            const currentDotSize = (rowCount + colCount) % 2 === 0 ? size : size * 0.8;
            const dot = figma.createEllipse();
            dot.resize(currentDotSize, currentDotSize);
            dot.fills = [{ type: 'SOLID', color: dotColor }]; // 白色原点
            // 相对frame的位置设置
            dot.x = x;
            dot.y = y;
            // 将圆点作为frame的子对象
            frame.appendChild(dot);
            x += xSpacing;
            colCount++;
        }
        // 重置 x 位置，并移动到下一行
        x = size / 2;
        y += ySpacing;
        rowCount++;
    }
}
// 生成相同大小的圆点
function generateEvenPolka(frame, width, height, size, dotColor) {
    // 设置初始位置和间隔
    const xSpacing = size * 2;
    const ySpacing = size * 2;
    let x = size / 2;
    let y = size / 2;
    let rowCount = 0;
    // 循环生成波尔卡圆点
    while (y + size / 2 <= height) {
        let colCount = 0;
        while (x + size / 2 <= width) {
            // 圆点size全部等于size
            const currentDotSize = size;
            const dot = figma.createEllipse();
            dot.resize(currentDotSize, currentDotSize);
            dot.fills = [{ type: 'SOLID', color: dotColor }]; // 白色原点
            // 相对frame的位置设置
            dot.x = x;
            dot.y = y;
            // 将圆点作为frame的子对象
            frame.appendChild(dot);
            x += xSpacing;
            colCount++;
        }
        // 重置 x 位置，并移动到下一行
        x = size / 2;
        y += ySpacing;
        rowCount++;
    }
}
// 生成南瓜样式圆点
function generatePumpkinPolka(frame, width, height, size, dotColor) {
    // 设置初始位置和间隔
    const yCenter = height / 2;
    let maxDotSize = size; // 最中间行的圆点直径
    const minDotSize = size * 0.05; // 圆点最小尺寸
    const ySpace = size;
    // 从中央开始生成最大的一行，先手动生成1行
    generateRowOfDots(frame, yCenter, width, maxDotSize, dotColor);
    // 向上和向下对称生成逐渐变小的斑点
    let yOffset = ySpace;
    while (maxDotSize > minDotSize) {
        // 缩放圆点
        const scaleDotFactor = 0.65; // 每次迭代圆点大小为原来的0.65
        maxDotSize *= scaleDotFactor; // 根据缩放系数调整圆点大小
        // 生成上方的行
        generateRowOfDots(frame, yCenter - yOffset, width, maxDotSize, dotColor);
        // 生成下方的行
        generateRowOfDots(frame, yCenter + yOffset, width, maxDotSize, dotColor);
        // 调整行间距
        yOffset += 1.25 * maxDotSize;
    }
}
function generateRowOfDots(frame, y, width, dotSize, dotColor) {
    let x = dotSize * 0.2;
    const xSpacing = dotSize * 1.25; // 控制列距
    while (x + dotSize / 2 <= width) {
        const dot = figma.createEllipse();
        dot.resize(dotSize, dotSize);
        dot.fills = [{ type: 'SOLID', color: dotColor }];
        dot.x = x;
        dot.y = y - dotSize / 2; //确保圆心在y轴上
        frame.appendChild(dot);
        x += xSpacing; // 移动到下一列
    }
}
