import { faker } from '@faker-js/faker'
import {
  Cargo,
  CargoType,
  CargoStatus,
  StorageArea,
  AreaType,
  AreaStatus,
  TransportTask,
  TransportTaskType,
  TransportTaskStatus,
  TaskPriority,
  TransportMachine,
  MachineType,
  MachineStatus,
  Trajectory,
  TrajectoryType,
  TrajectoryStatus,
  Position,
  Orientation,
  Dimensions,
  TrajectoryPoint,
  PointType,
  PointStatus,
  TrajectoryComplexity,
  PowerType,
  OperationType,
  AutomationLevel,
  SafetyFeature,
  MaintenanceStatus,
  PathSegment,
  PathType,
  PathSegmentStatus,
} from '../types'

/**
 * Mock 数据生成器
 */
export class MockDataGenerator {
  /**
   * 生成随机位置
   */
  static generatePosition(): Position {
    return {
      x: faker.number.float({ min: -50, max: 50, fractionDigits: 1 }),
      y: faker.number.float({ min: 0, max: 10, fractionDigits: 1 }),
      z: faker.number.float({ min: -50, max: 50, fractionDigits: 1 }),
    }
  }

  /**
   * 生成随机姿态
   */
  static generateOrientation(): Orientation {
    return {
      pitch: faker.number.float({ min: -Math.PI, max: Math.PI, fractionDigits: 2 }),
      roll: faker.number.float({ min: -Math.PI, max: Math.PI, fractionDigits: 2 }),
      yaw: faker.number.float({ min: -Math.PI, max: Math.PI, fractionDigits: 2 }),
    }
  }

  /**
   * 生成随机尺寸
   */
  static generateDimensions(): Dimensions {
    return {
      length: faker.number.float({ min: 0.5, max: 10, fractionDigits: 1 }),
      width: faker.number.float({ min: 0.5, max: 5, fractionDigits: 1 }),
      height: faker.number.float({ min: 0.5, max: 3, fractionDigits: 1 }),
    }
  }

  /**
   * 生成货物数据
   */
  static generateCargo(overrides: Partial<Cargo> = {}): Cargo {
    const id = overrides.id || faker.string.uuid()
    const type = overrides.type || faker.helpers.arrayElement([CargoType.TANK])
    const status =
      overrides.status ||
      faker.helpers.arrayElement([
        CargoStatus.STORED,
        CargoStatus.IN_TRANSIT,
        CargoStatus.LOADING,
        CargoStatus.UNLOADING,
        CargoStatus.MAINTENANCE,
        CargoStatus.DAMAGED,
      ])
    const dimensions = overrides.dimensions || MockDataGenerator.generateDimensions()
    const position = overrides.position || MockDataGenerator.generatePosition()
    const orientation = overrides.orientation || MockDataGenerator.generateOrientation()

    return {
      id,
      name: overrides.name || `${faker.commerce.productName()} ${faker.string.alphanumeric(6)}`,
      type,
      weight: overrides.weight || faker.number.float({ min: 100, max: 5000, fractionDigits: 1 }),
      dimensions,
      position,
      orientation,
      createdAt: overrides.createdAt || faker.date.recent().toISOString(),
      updatedAt: overrides.updatedAt || faker.date.recent().toISOString(),
      status,
      areaId: overrides.areaId || faker.string.uuid(),
      trajectory: overrides.trajectory || [],
      taskHistory: overrides.taskHistory || [],
    }
  }

  /**
   * 生成堆场区域数据
   */
  static generateStorageArea(overrides: Partial<StorageArea> = {}): StorageArea {
    const id = overrides.id || faker.string.uuid()
    const type =
      overrides.type ||
      faker.helpers.arrayElement([
        AreaType.STORAGE,
        AreaType.TRANSIT,
        AreaType.LOADING,
        AreaType.UNLOADING,
        AreaType.MAINTENANCE,
      ])
    const status =
      overrides.status ||
      faker.helpers.arrayElement([
        AreaStatus.ACTIVE,
        AreaStatus.INACTIVE,
        AreaStatus.MAINTENANCE,
        AreaStatus.FULL,
        AreaStatus.RESERVED,
      ])

    // 生成区域边界点
    const centerX = faker.number.float({ min: -50, max: 50 })
    const centerZ = faker.number.float({ min: -50, max: 50 })
    const width = faker.number.float({ min: 10, max: 10 })
    const depth = faker.number.float({ min: 5, max: 5 })
    const points: Position[] = []

    points.push({
      x: centerX + width / 2,
      y: 0,
      z: centerZ + depth / 2,
    })
    points.push({
      x: centerX - width / 2,
      y: 0,
      z: centerZ + depth / 2,
    })
    points.push({
      x: centerX + width / 2,
      y: 0,
      z: centerZ - depth / 2,
    })
    points.push({
      x: centerX - width / 2,
      y: 0,
      z: centerZ - depth / 2,
    })
    
    
    
    

    return {
      id,
      name:
        overrides.name ||
        `${faker.location.street()} ${faker.helpers.arrayElement(['A区', 'B区', 'C区', 'D区'])}`,
      type,
      status,
      boundary: {
        points,
        height: faker.number.float({ min: 12, max: 12, fractionDigits: 1 }),
        color: overrides.boundary?.color || faker.color.rgb(),
        lineWidth: overrides.boundary?.lineWidth || 2,
        visible: overrides.boundary?.visible ?? true,
      },
      capacity: {
        maxCargoCount: overrides.capacity?.maxCargoCount || faker.number.int({ min: 10, max: 100 }),
        maxWeight:
          overrides.capacity?.maxWeight ||
          faker.number.float({ min: 1000, max: 10000, fractionDigits: 1 }),
        maxVolume:
          overrides.capacity?.maxVolume ||
          faker.number.float({ min: 100, max: 1000, fractionDigits: 1 }),
        supportedCargoTypes: overrides.capacity?.supportedCargoTypes || [CargoType.TANK],
      },
      usage: {
        currentCargoCount:
          overrides.usage?.currentCargoCount || faker.number.int({ min: 0, max: 50 }),
        currentWeight:
          overrides.usage?.currentWeight ||
          faker.number.float({ min: 0, max: 5000, fractionDigits: 1 }),
        currentVolume:
          overrides.usage?.currentVolume ||
          faker.number.float({ min: 0, max: 500, fractionDigits: 1 }),
        utilizationRate:
          overrides.usage?.utilizationRate ||
          faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
        lastUpdated: overrides.usage?.lastUpdated || faker.date.recent().toISOString(),
      },
      tags: overrides.tags || [faker.helpers.arrayElement(['高架', '地面', '危险品', '普通货物'])],
      createdAt: overrides.createdAt || faker.date.recent().toISOString(),
      updatedAt: overrides.updatedAt || faker.date.recent().toISOString(),
      parentId: overrides.parentId,
      children: overrides.children || [],
      cargos: overrides.cargos || [],
    }
  }

  /**
   * 生成转运任务数据
   */
  static generateTransportTask(overrides: Partial<TransportTask> = {}): TransportTask {
    const id = overrides.id || faker.string.uuid()
    const type =
      overrides.type ||
      faker.helpers.arrayElement([
        TransportTaskType.LOAD,
        TransportTaskType.UNLOAD,
        TransportTaskType.MOVE,
        TransportTaskType.TRANSFER,
        TransportTaskType.REPOSITION,
        TransportTaskType.EMERGENCY,
      ])
    const status =
      overrides.status ||
      faker.helpers.arrayElement([
        TransportTaskStatus.PENDING,
        TransportTaskStatus.SCHEDULED,
        TransportTaskStatus.IN_PROGRESS,
        TransportTaskStatus.PAUSED,
        TransportTaskStatus.COMPLETED,
        TransportTaskStatus.FAILED,
        TransportTaskStatus.CANCELLED,
        TransportTaskStatus.TIMEOUT,
      ])
    const priority =
      overrides.priority ||
      faker.helpers.arrayElement([
        TaskPriority.LOW,
        TaskPriority.NORMAL,
        TaskPriority.HIGH,
        TaskPriority.URGENT,
        TaskPriority.CRITICAL,
      ])

    return {
      id,
      name:
        overrides.name ||
        `${faker.helpers.arrayElement(['装载', '卸载', '转运', '移动'])}任务 ${faker.string.alphanumeric(6)}`,
      type,
      status,
      priority,
      description: overrides.description || faker.lorem.sentence(),
      plannedStartTime: overrides.plannedStartTime || faker.date.future().toISOString(),
      plannedEndTime: overrides.plannedEndTime || faker.date.future().toISOString(),
      actualStartTime: overrides.actualStartTime,
      actualEndTime: overrides.actualEndTime,
      startPosition: overrides.startPosition || this.generatePosition(),
      targetPosition: overrides.targetPosition || this.generatePosition(),
      path: overrides.path || this.generatePathSegments(),
      cargoIds: overrides.cargoIds || [faker.string.uuid()],
      machineId: overrides.machineId || faker.string.uuid(),
      operatorId: overrides.operatorId || faker.string.uuid(),
      progress: overrides.progress || faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      createdAt: overrides.createdAt || faker.date.recent().toISOString(),
      updatedAt: overrides.updatedAt || faker.date.recent().toISOString(),
      notes: overrides.notes || faker.lorem.sentence(),
      tags: overrides.tags || [faker.helpers.arrayElement(['紧急', '普通', '高优先级'])],
      dependencies: overrides.dependencies || [],
      executionHistory: overrides.executionHistory || [],
    }
  }

  /**
   * 生成路径段数据
   */
  static generatePathSegments(): PathSegment[] {
    const segmentCount = faker.number.int({ min: 2, max: 5 })
    const segments: PathSegment[] = []

    for (let i = 0; i < segmentCount; i++) {
      segments.push({
        id: faker.string.uuid(),
        startPoint: this.generatePosition(),
        endPoint: this.generatePosition(),
        type: faker.helpers.arrayElement([
          PathType.STRAIGHT,
          PathType.CURVE,
          PathType.ELEVATOR,
          PathType.ROTATION,
          PathType.COMPLEX,
        ]),
        estimatedDuration: faker.number.float({ min: 10, max: 60, fractionDigits: 1 }),
        status: faker.helpers.arrayElement([
          PathSegmentStatus.PENDING,
          PathSegmentStatus.IN_PROGRESS,
          PathSegmentStatus.COMPLETED,
          PathSegmentStatus.FAILED,
          PathSegmentStatus.SKIPPED,
        ]),
      })
    }

    return segments
  }

  /**
   * 生成转运机械数据
   */
  static generateTransportMachine(overrides: Partial<TransportMachine> = {}): TransportMachine {
    const id = overrides.id || faker.string.uuid()
    const type =
      overrides.type ||
      faker.helpers.arrayElement([
        MachineType.CRANE,
        MachineType.FORKLIFT,
        MachineType.CONVEYOR,
        MachineType.ROBOT,
        MachineType.AGV,
        MachineType.HOIST,
        MachineType.TROLLEY,
      ])
    const status =
      overrides.status ||
      faker.helpers.arrayElement([
        MachineStatus.IDLE,
        MachineStatus.WORKING,
        MachineStatus.MAINTENANCE,
        MachineStatus.ERROR,
        MachineStatus.OFFLINE,
        MachineStatus.EMERGENCY,
        MachineStatus.CHARGING,
      ])

    return {
      id,
      name:
        overrides.name ||
        `${faker.helpers.arrayElement(['起重机', '叉车', '传送带', '机器人'])} ${faker.string.alphanumeric(6)}`,
      type,
      status,
      model: overrides.model || faker.vehicle.model(),
      specifications: {
        maxLoadCapacity:
          overrides.specifications?.maxLoadCapacity ||
          faker.number.float({ min: 1000, max: 10000, fractionDigits: 1 }),
        workingRange: {
          xRange: [-50, 50] as [number, number],
          yRange: [0, 20] as [number, number],
          zRange: [-50, 50] as [number, number],
          rotationRange: [-180, 180] as [number, number],
        },
        maxSpeed:
          overrides.specifications?.maxSpeed ||
          faker.number.float({ min: 0.5, max: 5, fractionDigits: 1 }),
        maxLiftSpeed:
          overrides.specifications?.maxLiftSpeed ||
          faker.number.float({ min: 0.1, max: 2, fractionDigits: 1 }),
        precision:
          overrides.specifications?.precision ||
          faker.number.float({ min: 1, max: 10, fractionDigits: 1 }),
        dimensions: overrides.specifications?.dimensions || this.generateDimensions(),
        weight:
          overrides.specifications?.weight ||
          faker.number.float({ min: 1000, max: 5000, fractionDigits: 1 }),
        powerType:
          overrides.specifications?.powerType ||
          faker.helpers.arrayElement([
            PowerType.ELECTRIC,
            PowerType.DIESEL,
            PowerType.HYBRID,
            PowerType.BATTERY,
            PowerType.WIRED,
          ]),
        batteryCapacity:
          overrides.specifications?.batteryCapacity ||
          faker.number.float({ min: 50, max: 200, fractionDigits: 1 }),
      },
      position: overrides.position || this.generatePosition(),
      orientation: overrides.orientation || this.generateOrientation(),
      capabilities: {
        supportedCargoTypes: [CargoType.TANK],
        supportedCargoSizes: {
          min: { length: 0.5, width: 0.5, height: 0.5 },
          max: { length: 10, width: 5, height: 3 },
        },
        supportedOperations: [
          OperationType.LIFT,
          OperationType.MOVE,
          OperationType.ROTATE,
          OperationType.GRAB,
          OperationType.RELEASE,
        ],
        automationLevel: AutomationLevel.SEMI_AUTO,
        safetyFeatures: [
          SafetyFeature.COLLISION_DETECTION,
          SafetyFeature.EMERGENCY_STOP,
          SafetyFeature.OVERLOAD_PROTECTION,
        ],
      },
      currentTaskId: overrides.currentTaskId,
      operatorId: overrides.operatorId || faker.string.uuid(),
      maintenance: {
        lastMaintenance:
          overrides.maintenance?.lastMaintenance || faker.date.recent().toISOString(),
        nextMaintenance:
          overrides.maintenance?.nextMaintenance || faker.date.future().toISOString(),
        maintenanceCycle:
          overrides.maintenance?.maintenanceCycle || faker.number.int({ min: 30, max: 90 }),
        status: MaintenanceStatus.NORMAL,
        history: [],
        maintainerId: faker.string.uuid(),
      },
      createdAt: overrides.createdAt || faker.date.recent().toISOString(),
      updatedAt: overrides.updatedAt || faker.date.recent().toISOString(),
      tags: overrides.tags || [faker.helpers.arrayElement(['高架', '地面', '自动化', '手动'])],
      notes: overrides.notes || faker.lorem.sentence(),
    }
  }

  /**
   * 生成轨迹数据
   */
  static generateTrajectory(overrides: Partial<Trajectory> = {}): Trajectory {
    const id = overrides.id || faker.string.uuid()
    const type =
      overrides.type ||
      faker.helpers.arrayElement([
        TrajectoryType.CARGO_MOVEMENT,
        TrajectoryType.MACHINE_OPERATION,
        TrajectoryType.TRANSPORT_PATH,
        TrajectoryType.MAINTENANCE_ROUTE,
        TrajectoryType.EMERGENCY_EVACUATION,
        TrajectoryType.OPTIMIZATION_PATH,
      ])
    const status =
      overrides.status ||
      faker.helpers.arrayElement([
        TrajectoryStatus.PLANNED,
        TrajectoryStatus.IN_PROGRESS,
        TrajectoryStatus.COMPLETED,
        TrajectoryStatus.CANCELLED,
        TrajectoryStatus.FAILED,
        TrajectoryStatus.ARCHIVED,
      ])

    // 生成轨迹点
    const pointCount = faker.number.int({ min: 5, max: 20 })
    const points: TrajectoryPoint[] = []
    let currentPosition = this.generatePosition()

    for (let i = 0; i < pointCount; i++) {
      currentPosition = {
        x: currentPosition.x + faker.number.float({ min: -5, max: 5, fractionDigits: 1 }),
        y: currentPosition.y + faker.number.float({ min: -1, max: 1, fractionDigits: 1 }),
        z: currentPosition.z + faker.number.float({ min: -5, max: 5, fractionDigits: 1 }),
      }

      points.push({
        id: faker.string.uuid(),
        timestamp: faker.date.recent().toISOString(),
        position: currentPosition,
        orientation: this.generateOrientation(),
        velocity: {
          linear: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
          angular: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
          x: faker.number.float({ min: -2, max: 2, fractionDigits: 1 }),
          y: faker.number.float({ min: -0.5, max: 0.5, fractionDigits: 1 }),
          z: faker.number.float({ min: -2, max: 2, fractionDigits: 1 }),
        },
        acceleration: {
          linear: faker.number.float({ min: -1, max: 1, fractionDigits: 1 }),
          angular: faker.number.float({ min: -0.5, max: 0.5, fractionDigits: 2 }),
          x: faker.number.float({ min: -0.5, max: 0.5, fractionDigits: 1 }),
          y: faker.number.float({ min: -0.2, max: 0.2, fractionDigits: 1 }),
          z: faker.number.float({ min: -0.5, max: 0.5, fractionDigits: 1 }),
        },
        type: faker.helpers.arrayElement([
          PointType.START,
          PointType.WAYPOINT,
          PointType.TURN,
          PointType.STOP,
          PointType.END,
          PointType.EMERGENCY,
          PointType.CHECKPOINT,
        ]),
        status: faker.helpers.arrayElement([
          PointStatus.PENDING,
          PointStatus.IN_PROGRESS,
          PointStatus.COMPLETED,
          PointStatus.FAILED,
          PointStatus.SKIPPED,
        ]),
        data: {},
      })
    }

    return {
      id,
      name:
        overrides.name ||
        `${faker.helpers.arrayElement(['货物移动', '机械操作', '转运路径'])}轨迹 ${faker.string.alphanumeric(6)}`,
      type,
      status,
      points,
      metadata: {
        totalDistance: faker.number.float({ min: 10, max: 100, fractionDigits: 1 }),
        totalTime: faker.number.float({ min: 30, max: 300, fractionDigits: 1 }),
        averageSpeed: faker.number.float({ min: 0.5, max: 3, fractionDigits: 1 }),
        maxSpeed: faker.number.float({ min: 2, max: 5, fractionDigits: 1 }),
        minSpeed: faker.number.float({ min: 0, max: 1, fractionDigits: 1 }),
        complexity: faker.helpers.arrayElement([
          TrajectoryComplexity.SIMPLE,
          TrajectoryComplexity.MODERATE,
          TrajectoryComplexity.COMPLEX,
          TrajectoryComplexity.VERY_COMPLEX,
        ]),
        qualityScore: faker.number.float({ min: 60, max: 100, fractionDigits: 1 }),
        optimizationSuggestions: [faker.lorem.sentence()],
        statistics: {
          turnCount: faker.number.int({ min: 0, max: 10 }),
          stopCount: faker.number.int({ min: 0, max: 5 }),
          accelerationCount: faker.number.int({ min: 0, max: 8 }),
          decelerationCount: faker.number.int({ min: 0, max: 8 }),
          averageTurnRadius: faker.number.float({ min: 5, max: 20, fractionDigits: 1 }),
          maxTurnRadius: faker.number.float({ min: 10, max: 30, fractionDigits: 1 }),
          minTurnRadius: faker.number.float({ min: 2, max: 10, fractionDigits: 1 }),
          smoothness: faker.number.float({ min: 0.5, max: 1, fractionDigits: 2 }),
        },
      },
      createdAt: overrides.createdAt || faker.date.recent().toISOString(),
      updatedAt: overrides.updatedAt || faker.date.recent().toISOString(),
      tags: overrides.tags || [faker.helpers.arrayElement(['优化', '正常', '异常'])],
      notes: overrides.notes || faker.lorem.sentence(),
    }
  }

  /**
   * 批量生成数据
   */
  static generateBatch<T>(
    generator: (overrides?: Partial<T>) => T,
    count: number,
    overrides: Partial<T> = {}
  ): T[] {
    const result: T[] = []
    for (let i = 0; i < count; i++) {
      result.push(generator(overrides))
    }
    return result
  }
}
