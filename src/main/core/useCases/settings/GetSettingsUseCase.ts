import { SettingsRepository } from '../../repositories/SettingsRepository';

export class GetSettingsUseCase {
  constructor(private settingsRepository: SettingsRepository) {}

  async execute(): Promise<Record<string, string>> {
    return this.settingsRepository.getAll();
  }
}
