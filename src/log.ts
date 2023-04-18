import { log } from './deps.ts'
import paths from './paths.ts'

class UnbufferedFileHandler extends log.handlers.FileHandler {
    override handle(logRecord: log.LogRecord) {
        super.handle(logRecord)
        this.flush()
    }
}

/**
 * Create a logger that writes to both file and console
 * @param opts
 */
function get(
    { name, fileName, consoleLevel = 'INFO', fileLevel = 'INFO', indent = 2 }: {
        name: string
        fileName?: string
        consoleLevel?: log.LevelName
        fileLevel?: log.LevelName

        // formatting opts
        indent?: number
    },
) {
    const logger = log.getLogger(name)

    // Set format
    const formatter = (record: log.LogRecord) => {
        const level = record.levelName

        let msg = JSON.stringify(record.msg, undefined, indent)
        record.args.forEach((x) => {
            msg += ' ' + JSON.stringify(x, undefined, indent)
        })

        return `${level} ${msg}`
    }

    // Create handlers
    logger.handlers = [
        new log.handlers.ConsoleHandler(consoleLevel, { formatter }),
        new UnbufferedFileHandler(fileLevel || consoleLevel, {
            filename: `${paths.LOG_DIR}/${fileName || name}.log`,
            formatter,
        }),
    ]
    logger.handlers.forEach((h) => h.setup())
    logger.level = log.LogLevels.NOTSET
    // don't stringify the message -- to keep it consistent with how the args are printed
    logger.asString = (x) => x as any

    return logger
}

export default { get }
