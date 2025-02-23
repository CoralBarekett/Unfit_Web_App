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
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    constructor(model) {
        this.model = model;
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = req.query.owner;
            try {
                if (filter) {
                    const item = yield this.model.find({ owner: filter });
                    res.send(item);
                }
                else {
                    const items = yield this.model.find();
                    res.send(items);
                }
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const item = yield this.model.findById(id);
                if (item != null) {
                    res.send(item);
                }
                else {
                    res.status(404).send("not found");
                }
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            try {
                const item = yield this.model.create(body);
                res.status(201).send(item);
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const body = req.body;
            try {
                console.log('Posts update service');
                const update = yield this.model.findByIdAndUpdate(id, body, { new: true });
                if (!update) {
                    res.status(404).send('Post not found');
                }
                else {
                    res.status(200).send(update);
                }
            }
            catch (error) {
                res.status(400).send(error.message);
            }
        });
    }
    deleteItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const rs = yield this.model.findByIdAndDelete(id);
                res.status(200).send("deleted");
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
}
exports.default = BaseController;
//# sourceMappingURL=baseController.js.map