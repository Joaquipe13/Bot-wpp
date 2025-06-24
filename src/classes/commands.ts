export class Commands {
  private static instance: Commands;
  private static readonly commands: string[] = [ "help", "ping", "top", "play", "final", "topdiario"];

  private constructor() {}

  public static getInstance(): Commands {
    if (!Commands.instance) {
      Commands.instance = new Commands();
    }
    return Commands.instance;
  }

  public exists(cmd: string): boolean {
    if (Commands.commands.includes(cmd.toLowerCase())) {
      return true;
    } else {
      throw new Error(`El comando '/${cmd}' no existe.\n\nUse '/help' para ver la lista de comandos disponibles.`);
    }
  }

  public help(): string {
    return Commands.commands.map(cmd => `/${cmd}`).join("\n");
  }

  public getAll(): string[] {
    return [...Commands.commands];
  }
}