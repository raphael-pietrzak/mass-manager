const celebrantController = require('../../src/controllers/celebrant.controller');
const Celebrant = require('../../src/models/celebrant.model');

// Mock des modules
jest.mock('../../src/models/celebrant.model');

describe('Celebrant Controller', () => {
  let mockRequest;
  let mockResponse;
  
  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  test('getCelebrants doit retourner tous les célébrants', async () => {
    const mockCelebrants = [
      { id: 1, religious_name: 'Frère Jean', role: 'prêtre' },
      { id: 2, religious_name: 'Frère Pierre', role: 'diacre' }
    ];
    
    Celebrant.getAll.mockResolvedValue(mockCelebrants);
    
    await celebrantController.getCelebrants(mockRequest, mockResponse);
    
    expect(Celebrant.getAll).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith(mockCelebrants);
  });

  test('getAvailableCelebrants doit retourner les célébrants disponibles à une date', async () => {
    const mockAvailableCelebrants = [
      { id: 1, religious_name: 'Frère Jean', role: 'prêtre' }
    ];
    
    mockRequest.query = { date: '2023-06-01' };
    
    Celebrant.getAvailableByDate.mockResolvedValue(mockAvailableCelebrants);
    
    await celebrantController.getAvailableCelebrants(mockRequest, mockResponse);
    
    expect(Celebrant.getAvailableByDate).toHaveBeenCalledWith('2023-06-01');
    expect(mockResponse.json).toHaveBeenCalledWith(mockAvailableCelebrants);
  });

  test('getAvailableCelebrants doit renvoyer une erreur si la date est manquante', async () => {
    mockRequest.query = {};
    
    await celebrantController.getAvailableCelebrants(mockRequest, mockResponse);
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
  });

  test('getCelebrant doit retourner un célébrant spécifique', async () => {
    const mockCelebrant = { id: 1, religious_name: 'Frère Jean', role: 'prêtre' };
    
    mockRequest.params = { id: 1 };
    Celebrant.getById.mockResolvedValue(mockCelebrant);
    
    await celebrantController.getCelebrant(mockRequest, mockResponse);
    
    expect(Celebrant.getById).toHaveBeenCalledWith(1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockCelebrant);
  });

  test('createCelebrant doit créer un nouveau célébrant', async () => {
    mockRequest.body = {
      religious_name: 'Frère Jacques',
      civil_first_name: 'Jacques',
      civil_last_name: 'Martin',
      title: 'Père',
      role: 'prêtre'
    };
    
    Celebrant.create.mockResolvedValue(3);
    
    await celebrantController.createCelebrant(mockRequest, mockResponse);
    
    expect(Celebrant.create).toHaveBeenCalledWith(expect.objectContaining({
      religious_name: 'Frère Jacques'
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  test('updateCelebrant doit mettre à jour un célébrant', async () => {
    mockRequest.params = { id: 1 };
    mockRequest.body = {
      religious_name: 'Frère Jean-Pierre',
      role: 'prêtre'
    };
    
    await celebrantController.updateCelebrant(mockRequest, mockResponse);
    
    expect(Celebrant.update).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      religious_name: 'Frère Jean-Pierre'
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(204);
  });

  test('deleteCelebrant doit supprimer un célébrant', async () => {
    mockRequest.params = { id: 1 };
    
    await celebrantController.deleteCelebrant(mockRequest, mockResponse);
    
    expect(Celebrant.delete).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(204);
  });
});
