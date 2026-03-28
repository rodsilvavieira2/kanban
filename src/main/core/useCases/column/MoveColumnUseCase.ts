import { IColumnRepository } from "../../domain/repositories/IColumnRepository";

export interface MoveColumnRequest {
  projectId: string;
  sourceIndex: number;
  destinationIndex: number;
}

export class MoveColumnUseCase {
  constructor(private columnRepository: IColumnRepository) {}

  async execute(request: MoveColumnRequest): Promise<void> {
    const { projectId, sourceIndex, destinationIndex } = request;

    const columns = await this.columnRepository.findAllByProjectId(projectId);
    
    // Ensure columns are sorted by order
    columns.sort((a, b) => a.order - b.order);

    // Remove from source and insert at destination
    const [movedColumn] = columns.splice(sourceIndex, 1);
    columns.splice(destinationIndex, 0, movedColumn);

    // Create the updated order payload
    const updatedColumns = columns.map((col, index) => ({
      id: col.id,
      order: index,
    }));

    await this.columnRepository.reorder(updatedColumns);
  }
}
