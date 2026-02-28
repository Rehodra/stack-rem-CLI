import User from '../models/user.models.js';

export const getUsersForSideBar = async (req, res) => {
    try {
        const currentUserId = req.userId;

        const filterUsers = await User.find({_id: {$ne: currentUserId}});

        res.status(200).json(filterUsers);
    } catch (error) {
        res.status(500).json({ message: "Internal server error in getUsersForSideBar" + error });
    }
}