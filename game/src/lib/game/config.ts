/**
 * Tile colors used in the game
 */
export const TILE_COLORS = {
    RED: 0xff6b6b,
    GREEN: 0x51cf66,
    BLUE: 0x339af0,
    YELLOW: 0xfcc419,
    PURPLE: 0xbe4bdb,
    ORANGE: 0xff922b,
};

export const TILE_COLOR_ARRAY = Object.values(TILE_COLORS);

/**
 * Game constants
 */
export const GAME_CONFIG = {
    GRID_SIZE: 8,
    TILE_SIZE: 50,
    TILE_GAP: 4,
    MATCH_MIN: 3,
    GAME_DURATION: 60, // seconds
    COMBO_MULTIPLIER: 1.5,
    BASE_SCORE: 10,
};
