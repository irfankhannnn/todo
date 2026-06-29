export const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
};
//# sourceMappingURL=errorHandler.js.map