const specialDayController = require('../../src/controllers/specialDay.controller');
const SpecialDay = require('../../src/models/specialDay.model');

// Mock des modules
jest.mock('../../src/models/specialDay.model');

describe('SpecialDay Controller', () => {
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

  test('getSpecialDays doit retourner tous les jours spéciaux', async () => {
    const mockSpecialDays = [
      { id: 1, date: '2023-12-25', description: 'Noël', number_of_masses: 3 },
      { id: 2, date: '2023-04-09', description: 'Pâques', number_of_masses: 4 }
    ];
    
    SpecialDay.getAll.mockResolvedValue(mockSpecialDays);
    
    await specialDayController.getSpecialDays(mockRequest, mockResponse);
    
    expect(SpecialDay.getAll).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith(mockSpecialDays);
  });

  test('getSpecialDay doit retourner un jour spécial spécifique', async () => {
    const mockSpecialDay = { id: 1, date: '2023-12-25', description: 'Noël', number_of_masses: 3 };
    
    mockRequest.params = { id: 1 };
    SpecialDay.getById.mockResolvedValue(mockSpecialDay);
    
    await specialDayController.getSpecialDay(mockRequest, mockResponse);
    
    expect(SpecialDay.getById).toHaveBeenCalledWith(1);
    expect(mockResponse.json).toHaveBeenCalledWith(mockSpecialDay);
  });

  test('createSpecialDay doit créer un nouveau jour spécial', async () => {
    mockRequest.body = {
      date: '2023-12-25',
      note: 'Noël',
      number_of_masses: 3,
      is_recurrent: true
    };
    
    await specialDayController.createSpecialDay(mockRequest, mockResponse);
    
    expect(SpecialDay.create).toHaveBeenCalledWith(expect.objectContaining({
      date: '2023-12-25',
      description: 'Noël',
      number_of_masses: 3,
      is_recurrent: true
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  test('updateSpecialDay doit mettre à jour un jour spécial', async () => {
    mockRequest.params = { id: 1 };
    mockRequest.body = {
      date: '2023-12-25',
      note: 'Noël modifié',
      number_of_masses: 4,
      is_recurrent: true
    };
    
    await specialDayController.updateSpecialDay(mockRequest, mockResponse);
    
    expect(SpecialDay.update).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      date: '2023-12-25',
      description: 'Noël modifié'
    }));
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  test('deleteSpecialDay doit supprimer un jour spécial', async () => {
    mockRequest.params = { id: 1 };
    
    await specialDayController.deleteSpecialDay(mockRequest, mockResponse);
    
    expect(SpecialDay.delete).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(204);
  });
});
