import { SettingsRepository } from "../../repositories/SettingsRepository";

export class UpdateSettingsUseCase {
  constructor(private settingsRepository: SettingsRepository) {}

  async execute(settings: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.settingsRepository.set(key, value);
    }
  }
}
