const intentionController = require('../../src/controllers/intention.controller');
const Intention = require('../../src/models/intention.model');

// Mock des modules
jest.mock('../../src/models/intention.model');
jest.mock('../../src/models/donor.model');
jest.mock('../../config/database', () => ({
  transaction: jest.fn(callback => callback({ 
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn().mockResolvedValue([1])
  }))
}));

describe('Intention Controller', () => {
  let mockRequest;
  let mockResponse;
  
  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
  });

  test('getIntentions doit retourner toutes les intentions', async () => {
    const mockIntentions = [
      { id: 1, intention_text: 'Test 1' },
      { id: 2, intention_text: 'Test 2' }
    ];
    
    Intention.getAll.mockResolvedValue(mockIntentions);
    
    await intentionController.getIntentions(mockRequest, mockResponse);
    
    expect(mockResponse.json).toHaveBeenCalledWith(mockIntentions);
  });

  test('getIntention doit retourner une intention spécifique', async () => {
    const mockIntention = { id: 1, intention_text: 'Test 1' };
    Intention.findById.mockResolvedValue(mockIntention);
    
    mockRequest.params = { id: 1 };
    
    await intentionController.getIntention(mockRequest, mockResponse);
    
    expect(Intention.findById).toHaveBeenCalledWith(1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockIntention);
  });

  test('createIntention doit créer une nouvelle intention', async () => {
    mockRequest.body = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      intention_text: 'Nouvelle intention',
      type: 'vivants',
      amount: 20,
      payment_method: 'cash'
    };
    
    await intentionController.createIntention(mockRequest, mockResponse);
    
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalled();
  });

  test('updateIntention doit mettre à jour une intention', async () => {
    mockRequest.params = { id: 1 };
    mockRequest.body = {
      intention_text: 'Intention modifiée',
      amount: 30
    };
    
    Intention.update.mockResolvedValue(1);
    
    await intentionController.updateIntention(mockRequest, mockResponse);
    
    expect(Intention.update).toHaveBeenCalledWith(1, expect.objectContaining({
      intention_text: 'Intention modifiée',
      amount: 30
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(204);
  });

  test('deleteIntention doit supprimer une intention', async () => {
    mockRequest.params = { id: 1 };
    
    Intention.delete.mockResolvedValue(1);
    
    await intentionController.deleteIntention(mockRequest, mockResponse);
    
    expect(Intention.delete).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(204);
  });

  test('getPendingIntentions doit récupérer les intentions en attente', async () => {
    const mockPendingIntentions = [
      { id: 1, intention_text: 'Intention en attente' }
    ];
    
    Intention.getPendingIntentions.mockResolvedValue(mockPendingIntentions);
    
    await intentionController.getPendingIntentions(mockRequest, mockResponse);
    
    expect(mockResponse.json).toHaveBeenCalledWith(mockPendingIntentions);
  });
});
