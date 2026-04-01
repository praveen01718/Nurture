const { Parent, Child, sequelize } = require('../models');

exports.getParents = async (req, res) => {
  try {
    const parents = await Parent.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(parents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addParentWithChildren = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { parentData, children } = req.body;
    const newParent = await Parent.create(parentData, { transaction: t });

    if (children && Array.isArray(children)) {
      const cleanedChildren = children.map(child => ({
        ...child,
        parentId: newParent.id,
        expectedDeliveryDate: child.premature === "yes" ? child.expectedDeliveryDate : null,
        weeksPremature: child.premature === "yes" ? parseInt(child.weeksPremature, 10) || 0 : null,
        bloodGroup: child.bloodGroup || null,
        notes: child.notes || null
      }));
      await Child.bulkCreate(cleanedChildren, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ success: true, message: "Saved successfully!" });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.deleteParent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    await Child.destroy({ where: { parentId: id }, transaction: t });

    const deleted = await Parent.destroy({ where: { id }, transaction: t });

    if (deleted) {
      await t.commit();
      res.status(200).json({ success: true, message: "Deleted successfully !" });
    } else {
      await t.rollback();
      res.status(404).json({ success: false, message: "Record not found" });
    }
  } catch (error) {
    if (t) await t.rollback();
    console.error("Delete Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateParent = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { parentData, children } = req.body;

    await Parent.update(parentData, { where: { id }, transaction: t });

    if (children && Array.isArray(children)) {
      await Child.destroy({ where: { parentId: id }, transaction: t });

      const cleanedChildren = children.map(child => ({
        ...child,
        parentId: id,
        expectedDeliveryDate: child.premature === "yes" ? child.expectedDeliveryDate : null,
        weeksPremature: child.premature === "yes" ? parseInt(child.weeksPremature, 10) || 0 : null,
        bloodGroup: child.bloodGroup || null,
        notes: child.notes || null
      }));

      await Child.bulkCreate(cleanedChildren, { transaction: t });
    }

    await t.commit();
    res.status(200).json({ success: true, message: "Updated successfully!" });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await Parent.findByPk(id, {
      include: [{ model: Child, as: 'children' }]
    });
    if (!parent) return res.status(404).json({ message: "Not found" });
    res.status(200).json(parent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};