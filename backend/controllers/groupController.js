const Group = require('../models/Group');
const User = require('../models/User');
const { createGroupContract } = require('../services/web3Service');

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const creator = req.user._id;

    // Check if user is already in a group
    const existingUser = await User.findById(creator);
    if (existingUser.currentGroup) {
      return res.status(400).json({
        success: false,
        message: 'User already belongs to a group'
      });
    }

    // Deploy smart contract
    const contractAddress = await createGroupContract(name, members);

    // Create group in database
    const newGroup = await Group.create({
      name,
      creator,
      members: [creator],
      contractAddress,
      threshold: Math.ceil((members.length + 1) / 2) // >50%
    });

    // Add group to user
    await User.findByIdAndUpdate(creator, {
      currentGroup: newGroup._id
    });

    res.status(201).json({
      success: true,
      group: newGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Group creation failed',
      error: error.message
    });
  }
};

exports.getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'username walletAddress')
      .populate('members', 'username walletAddress');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.status(200).json({
      success: true,
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group details',
      error: error.message
    });
  }
};

exports.requestToJoinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    const user = await User.findById(req.user._id);

    if (user.currentGroup) {
      return res.status(400).json({
        success: false,
        message: 'User already belongs to a group'
      });
    }

    group.pendingMembers.push({ user: user._id });
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Join request submitted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process join request',
      error: error.message
    });
  }
};