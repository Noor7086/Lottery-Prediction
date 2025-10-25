import express from 'express';

const router = express.Router();

// @route   GET /api/lotteries
// @desc    Get all supported lotteries
// @access  Public
router.get('/', async (req, res) => {
  try {
    const lotteries = [
      {
        id: 'gopher5',
        name: 'Gopher 5',
        code: 'GOPHER5',
        type: 'single',
        description: 'Pick 5 numbers from 1-47',
        price: 1,
        currency: 'USD',
        drawSchedule: [
          { day: 'monday', time: '20:00' },
          { day: 'wednesday', time: '20:00' },
          { day: 'friday', time: '20:00' }
        ],
        isActive: true,
        state: 'Minnesota',
        country: 'USA',
        officialWebsite: 'https://www.mnlottery.com/games/draw-games/gopher-5'
      },
      {
        id: 'pick3',
        name: 'Pick 3',
        code: 'PICK3',
        type: 'single',
        description: 'Pick 3 numbers from 0-9',
        price: 1,
        currency: 'USD',
        drawSchedule: [
          { day: 'monday', time: '18:30' },
          { day: 'tuesday', time: '18:30' },
          { day: 'wednesday', time: '18:30' },
          { day: 'thursday', time: '18:30' },
          { day: 'friday', time: '18:30' },
          { day: 'saturday', time: '18:30' },
          { day: 'sunday', time: '18:30' }
        ],
        isActive: true,
        state: 'Minnesota',
        country: 'USA',
        officialWebsite: 'https://www.mnlottery.com/games/draw-games/pick-3'
      },
      {
        id: 'lottoamerica',
        name: 'Lotto America',
        code: 'LOTTOAMERICA',
        type: 'double',
        description: 'Pick 5 from 52 + 1 from 10',
        price: 1,
        currency: 'USD',
        drawSchedule: [
          { day: 'monday', time: '21:00' },
          { day: 'thursday', time: '21:00' }
        ],
        isActive: true,
        state: 'Multi-State',
        country: 'USA',
        officialWebsite: 'https://www.lottoamerica.com'
      },
      {
        id: 'megamillion',
        name: 'Mega Million',
        code: 'MEGAMILLION',
        type: 'double',
        description: 'Pick 5 from 70 + 1 from 25',
        price: 2,
        currency: 'USD',
        drawSchedule: [
          { day: 'tuesday', time: '22:00' },
          { day: 'friday', time: '22:00' }
        ],
        isActive: true,
        state: 'Multi-State',
        country: 'USA',
        officialWebsite: 'https://www.megamillions.com'
      },
      {
        id: 'powerball',
        name: 'Powerball',
        code: 'POWERBALL',
        type: 'double',
        description: 'Pick 5 from 69 + 1 from 26',
        price: 2,
        currency: 'USD',
        drawSchedule: [
          { day: 'monday', time: '21:59' },
          { day: 'wednesday', time: '21:59' },
          { day: 'saturday', time: '21:59' }
        ],
        isActive: true,
        state: 'Multi-State',
        country: 'USA',
        officialWebsite: 'https://www.powerball.com'
      }
    ];

    res.json({
      success: true,
      data: { lotteries }
    });
  } catch (error) {
    console.error('Get lotteries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

