from dataclasses import dataclass

class MarketNotEnoughShares(Exception):
    """Exception raised when someone tries to buy more shares than
    what is available.
    """
    def __init__(self, amountTried, amountAvailable):
        message = f"tried to buy {amountTried}, but only {amountAvailable} available"
        super().__init__(message)


@dataclass
class Market():
    name: str
    yesAmount: int
    noAmount: int
    liquidity: int

    def __init__(self, name: str, yesAmount: int, noAmount: int) -> None:
        self.name = name
        self.yesAmount = yesAmount
        self.noAmount = noAmount
        self.liquidity = yesAmount * noAmount

    # Invariant: #yes * #no = liquidity
    def buyYes(self, amount: int) -> None:
        # TODO: How to deal with rounding?
        newYesAmount = self.yesAmount - amount
        if newYesAmount < 0:
            raise MarketNotEnoughShares(amount, self.yesAmount)
        newNoAmount = self.liquidity / newYesAmount
        self.yesAmount = newYesAmount
        self.noAmount = newNoAmount

    def buyNo(self, amount: int) -> None:
        newNoAmount = self.noAmount - amount
        if newNoAmount < 0:
            raise MarketNotEnoughShares(amount, self.noAmount)
        newYesAmount = self.liquidity / newNoAmount
        self.noAmount = newNoAmount
        self.yesAmount = newYesAmount

    def yesPrice(self) -> float:
        return self.noAmount / self.yesAmount

    def noPrice(self) -> float:
        return self.yesAmount / self.noAmount

    def addLiquidity() -> None:
        pass

    def RemoveLiquidity() -> None:
        pass

    # TODO: How to compare for equality, just use 'name' attribute?
    def __eq__(self, other) -> bool:
        pass


