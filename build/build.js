"use strict";
class ChainInside {
    constructor(config) {
        const that = this;
        this.closure = function () {
            requestAnimationFrame(function () {
                for (const el of that.collection) {
                    that.enforceChained(el);
                }
            });
        };
        this.collection = [];
        this.config = config;
        if (this.config.resize) {
            window.addEventListener("resize", this.closure);
        }
        if (this.config.interval !== undefined) {
            this.config.interval = setInterval(this.closure, this.config.interval);
        }
    }
    configurate(key, value) {
        switch (key) {
            case "target":
                if (typeof value !== "boolean") {
                    return "has to be boolean!";
                }
                if (value === this.config.target) {
                    return;
                }
                this.config.target = value;
                if (this.config.target) {
                    return;
                }
                const helpers = document.querySelectorAll(".chain-inside-helper");
                for (const h of Array.from(helpers)) {
                    h.remove();
                }
                return;
            case "contours":
                if (typeof value !== "boolean") {
                    return "has to be boolean!";
                }
                if (value === this.config.resize) {
                    return;
                }
                this.config.contours = value;
                if (value || this.contourElement === undefined) {
                    return;
                }
                return this.contourElement.remove();
            case "resize":
                if (typeof value !== "boolean") {
                    return "has to be boolean!";
                }
                if (value === this.config.resize) {
                    return;
                }
                if (value) {
                    window.addEventListener("resize", this.closure);
                }
                else {
                    window.removeEventListener("resize", this.closure);
                }
                return;
            case "interval":
                if (value === undefined) {
                    if (this.config.interval === undefined) {
                        return;
                    }
                    clearInterval(this.config.interval);
                    this.config.interval = undefined;
                    return;
                }
                if (typeof value !== "number") {
                    return "has to be number!";
                }
                if (value < 1) {
                    return "has to be at least 1";
                }
                if (!Number.isInteger(value)) {
                    return "has to be integer!";
                }
                this.config.interval = setInterval(this.closure, value);
                return;
            default:
                return `${key} is an unkown config!`;
        }
    }
    imageComplete(img) {
        return new Promise(function (resolve) {
            if (img.complete) {
                return resolve();
            }
            const interval = setInterval(function () {
                if (!img.complete) {
                    return;
                }
                clearInterval(interval);
                return resolve();
            }, 20);
        });
    }
    async enforceChained(target) {
        await this.imageComplete(target.chained);
        target.chained.removeAttribute("style");
        const nw = target.chained.naturalWidth;
        const nh = target.chained.naturalHeight;
        const cw = target.container.offsetWidth;
        const ch = target.container.offsetHeight;
        const [imgX, imgY, wrpX, wrpY] = [
            this.percentageToPixel(target.imgX, nw),
            this.percentageToPixel(target.imgY, nh),
            this.percentageToPixel(target.imgX, cw),
            this.percentageToPixel(target.imgX, ch),
        ];
        //left top right bottom
        const sides = [
            imgX / wrpX,
            imgY / wrpY,
            (nw - imgX) / (cw - wrpX),
            (nh - imgY) / (ch - wrpY),
        ];
        const factor = Math.min(...sides);
        target.chained.style.width = `${Math.floor(nw / factor)}px`;
        target.chained.style.height = `${Math.floor(nh / factor)}px`;
        target.chained.style.left = `${-Math.floor(imgX / factor) + wrpX}px`;
        target.chained.style.top = `${-Math.floor(imgY / factor) + wrpY}px`;
        if (this.config.contours) {
            this.drawImageContour(target.chained);
        }
        if (this.config.target) {
            this.drawTarget(target.container, wrpX, wrpY);
        }
    }
    drawImageContour(img) {
        const bound = img.getBoundingClientRect();
        if (this.contourElement !== undefined) {
            this.contourElement.remove();
        }
        const rect = document.createElement("div");
        this.contourElement = rect;
        rect.style.position = "fixed";
        rect.style.backgroundColor = "transparent";
        rect.style.border = "3px solid purple";
        for (const key of ["left", "top", "width", "height"]) {
            rect.style[key] = `${bound[key]}px`;
        }
        document.body.appendChild(this.contourElement);
    }
    drawTarget(container, wrpX, wrpY) {
        const helpers = container.querySelectorAll(".chain-inside-helper");
        for (const helper of Array.from(helpers)) {
            const isVertical = helper.classList.contains("chain-inside-y");
            helper.style.height = `${isVertical ? container.offsetHeight : 1}px`;
            helper.style.width = `${isVertical ? 1 : container.offsetWidth}px`;
            helper.style.left = `${isVertical ? wrpX : 0}px`;
            helper.style.top = `${isVertical ? 0 : wrpY}px`;
            helper.style.position = "absolute";
            helper.style.backgroundColor = "red";
        }
    }
    register(chained, imgX, imgY, wrpX, wrpY) {
        const container = chained.parentElement;
        if (container === null) {
            return "chained image has no parent element!";
        }
        const nw = chained.naturalWidth;
        const nh = chained.naturalHeight;
        const cw = container.offsetWidth;
        const ch = container.offsetHeight;
        if (this.isPixel(imgX)) {
            imgX = this.pixelToPercentage(imgX, nw);
        }
        if (this.isPixel(imgY)) {
            imgY = this.pixelToPercentage(imgY, nh);
        }
        if (this.isPixel(wrpX)) {
            wrpX = this.pixelToPercentage(wrpX, cw);
        }
        if (this.isPixel(wrpY)) {
            wrpY = this.pixelToPercentage(wrpY, ch);
        }
        const newChained = {
            chained: chained,
            container: container,
            imgX: imgX,
            imgY: imgY,
            wrpX: wrpX,
            wrpY: wrpY,
        };
        if (this.config.target) {
            const helper = document.createElement("div");
            helper.classList.add("chain-inside-helper");
            const x = helper.cloneNode();
            const y = helper.cloneNode();
            x.classList.add("chain-inside-x");
            y.classList.add("chain-inside-y");
            container.appendChild(x);
            container.appendChild(y);
        }
        this.collection.push(newChained);
        this.enforceChained(newChained);
    }
    isPercentage(input) {
        return !(input < 0 || input > 1);
    }
    isPixel(input) {
        if (input < 0) {
            return false;
        }
        if (this.isPercentage(input)) {
            return false;
        }
        return Number.isInteger(input);
    }
    percentageToPixel(input, context) {
        return Math.floor(context * input);
    }
    pixelToPercentage(input, context) {
        return input / context;
    }
}
//# sourceMappingURL=build.js.map