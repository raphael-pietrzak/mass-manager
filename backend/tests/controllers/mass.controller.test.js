const massController = require('../../src/controllers/mass.controller');
const Mass = require('../../src/models/mass.model');
const Intention = require('../../src/models/intention.model');
const Donor = require('../../src/models/donor.model');

// Mock des modules
jest.mock('../../src/models/mass.model');
jest.mock('../../src/models/intention.model');
jest.mock('../../src/models/donor.model');
jest.mock('../../config/database');

describe('Mass Controller', () => {
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

  test('getMasses doit retourner toutes les messes', async () => {
    const mockMasses = [
      { id: 1, date: '2023-05-15', status: 'pending' },
      { id: 2, date: '2023-05-16', status: 'completed' }
    ];
    
    Mass.getAll.mockResolvedValue(mockMasses);
    
    await massController.getMasses(mockRequest, mockResponse);
    
    expect(Mass.getAll).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith(mockMasses);
  });

  test('getMass doit retourner une messe spécifique', async () => {
    const mockMass = { id: 1, date: '2023-05-15', status: 'pending' };
    Mass.getById.mockResolvedValue(mockMass);
    
    mockRequest.params = { id: 1 };
    
    await massController.getMass(mockRequest, mockResponse);
    
    expect(Mass.getById).toHaveBeenCalledWith(1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockMass);
  });

  test('createMass doit créer une nouvelle messe avec son intention', async () => {
    mockRequest.body = {
      date: '2023-06-01',
      celebrant_id: 3,
      type: 'vivants',
      intention_text: 'Test intention',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      phone: '0123456789',
      address: '1 rue de Paris',
      postalCode: '75001',
      city: 'Paris',
      amount: '20',
      paymentMethod: 'cash',
      dateType: 'fixe'
    };
    
    Donor.create.mockResolvedValue(5); // ID du donateur créé
    Intention.create.mockResolvedValue(10); // ID de l'intention créée
    Mass.create.mockResolvedValue(15); // ID de la messe créée
    
    await massController.createMass(mockRequest, mockResponse);
    
    expect(Donor.create).toHaveBeenCalledWith(expect.objectContaining({
      firstname: 'Jean',
      lastname: 'Dupont'
    }));
    expect(Intention.create).toHaveBeenCalledWith(expect.objectContaining({
      donor_id: 5,
      intention_text: 'Test intention'
    }));
    expect(Mass.create).toHaveBeenCalledWith(expect.objectContaining({
      date: '2023-06-01',
      intention_id: 10
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  test('updateMass doit mettre à jour une messe', async () => {
    mockRequest.params = { id: 1 };
    mockRequest.body = {
      date: '2023-06-02',
      celebrant_id: 4,
      intention_id: 10,
      status: 'completed'
    };
    
    await massController.updateMass(mockRequest, mockResponse);
    
    expect(Mass.update).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      date: '2023-06-02',
      status: 'completed'
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(204);
  });

  test('deleteMass doit supprimer une messe', async () => {
    mockRequest.params = { id: 1 };
    
    await massController.deleteMass(mockRequest, mockResponse);
    
    expect(Mass.delete).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(204);
  });

  test('previewMass doit prévisualiser les messes à créer', async () => {
    const mockPreview = {
      masses: [
        { id: 'preview-1', date: '2023-06-01', intention: 'Test intention' }
      ],
      massCount: 1,
      totalAmount: '20.00'
    };
    
    mockRequest.body = {
      date: '2023-06-01',
      intention: 'Test intention',
      amount: '20',
      massCount: 1
    };
    
    // Ce test ne mock pas la fonction interne generateMassPreview directement
    // car c'est une fonction privée. On vérifie plutôt la réponse.
    
    await massController.previewMass(mockRequest, mockResponse);
    
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      masses: expect.any(Array),
      massCount: expect.any(Number),
      totalAmount: expect.any(String)
    }));
  });
});
