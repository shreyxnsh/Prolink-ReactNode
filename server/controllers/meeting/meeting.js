const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');
const index = async (req, res) => {
    let query = req.query;
    query.deleted = false;
    if (query.createBy) {
        query.createBy = new mongoose.Types.ObjectId(query.createBy);
    }

    try {
        let result = await MeetingHistory.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'Contacts',
                    localField: 'attendes',
                    foreignField: '_id',
                    as: 'contacts'
                }
            },
            {
                $lookup: {
                    from: 'Leads',
                    localField: 'attendesLead',
                    foreignField: '_id',
                    as: 'leads'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    createByName: '$users.username',
                }
            },
            { $project: { users: 0 } },
        ]);

        res.send(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

const add = async (req, res) => {
    try {
        const { agenda, attendes, attendesLead, location, related, dateTime, notes, createBy } = req.body;

        // Validate attendes array if provided
        if (attendes && Array.isArray(attendes)) {
            const invalidAttendes = attendes.some(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidAttendes) {
                return res.status(400).json({ error: 'Invalid attendee ID in attendes array' });
            }
        }

        // Validate attendesLead array if provided
        if (attendesLead && Array.isArray(attendesLead)) {
            const invalidAttendesLead = attendesLead.some(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidAttendesLead) {
                return res.status(400).json({ error: 'Invalid attendee ID in attendesLead array' });
            }
        }

        const meetingData = {
            agenda,
            attendes: attendes || [],
            attendesLead: attendesLead || [],
            location,
            related,
            dateTime,
            notes,
            createBy,
            timestamp: new Date()
        };

        const result = new MeetingHistory(meetingData);
        await result.save();
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to create meeting:', err);
        res.status(400).json({ error: 'Failed to create meeting', err });
    }
}

const view = async (req, res) => {
    try {
        let response = await MeetingHistory.findOne({ _id: req.params.id });
        if (!response) return res.status(404).json({ message: "No Data Found." });

        let result = await MeetingHistory.aggregate([
            { $match: { _id: response._id } },
            {
                $lookup: {
                    from: 'Contacts',
                    localField: 'attendes',
                    foreignField: '_id',
                    as: 'contactAttendees'
                }
            },
            {
                $lookup: {
                    from: 'Leads',
                    localField: 'attendesLead',
                    foreignField: '_id',
                    as: 'leadAttendees'
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'createBy',
                    foreignField: '_id',
                    as: 'creator'
                }
            },
            { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    attendeeNames: {
                        $concatArrays: [
                            {
                                $map: {
                                    input: '$contactAttendees',
                                    as: 'contact',
                                    in: {
                                        $concat: ['$contact.title', ' ', '$contact.firstName', ' ', '$contact.lastName']
                                    }
                                }
                            },
                            {
                                $map: {
                                    input: '$leadAttendees',
                                    as: 'lead',
                                    in: '$lead.leadName'
                                }
                            }
                        ]
                    },
                    creatorName: '$creator.username'
                }
            },
            { $project: { creator: 0, contactAttendees: 0, leadAttendees: 0 } }
        ]);

        res.status(200).json(result[0]);
    } catch (err) {
        console.log('Error:', err);
        res.status(400).json({ Error: err });
    }
}

const deleteData = async (req, res) => {
    try {
        const result = await MeetingHistory.findByIdAndUpdate(
            req.params.id,
            { deleted: true },
            { new: true }
        );
        res.status(200).json({ message: "Meeting deleted successfully", result });
    } catch (err) {
        res.status(404).json({ message: "Error deleting meeting", err });
    }
}

const deleteMany = async (req, res) => {
    try {
        const result = await MeetingHistory.updateMany(
            { _id: { $in: req.body } },
            { $set: { deleted: true } }
        );

        if (result?.matchedCount > 0 && result?.modifiedCount > 0) {
            return res.status(200).json({ message: "Meetings removed successfully", result });
        } else {
            return res.status(404).json({ success: false, message: "Failed to remove meetings" });
        }
    } catch (err) {
        return res.status(404).json({ success: false, message: "Error removing meetings", err });
    }
}

module.exports = { index, add, view, deleteData, deleteMany };