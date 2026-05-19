export const validateCreateComplaint = (req, res, next) => {
  const { title, description, type } = req.body;

  if (!title || !description || !type) {
    return res.status(400).json({
      message: "Title, description and type are required"
    });
  }

  next();
};
