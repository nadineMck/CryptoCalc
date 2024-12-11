def _parse_bin(b: str) -> list:
    """
    Convert a binary number to a list representing polynomial coefficients.
    :param b: The binary number
    :return: the converted list
    """
    # check for python-formatted binary strings
    try:
        if len(b) > 1 and b[:2] == "0b":
            b = b[2:]
        L = []
        for char in b[::-1]:
            # accept any nonzero character as true, cast down from unconstrained space to space mod 2
            L.append(False if char == "0" else True)
        return L
    except ValueError:
        raise ValueError("Invalid format for input: " + b)


def _parse_string(s: str) -> list:
    try:
        """
        Converts a polynomial string to a list representing polynomial coefficients.
        :param s: polynomial string
        :return: converted list
        """
        c = [x.strip() for x in s.lower().strip().split("+")]
        n = {}

        # accept any coefficients +ve or -ve in any order, then do mod 2
        def __add_term_n(p: int, val: int) -> None:
            if p not in n:
                n[p] = val
            else:
                n[p] += val

        # convert the unsorted coefficient list to a sorted mod 2 coefficient list
        def __dict_to_list():
            max_power = max(n.keys())
            L = []
            for i in range(max_power + 1):
                if i in n:
                    L.append(False if n[i] == 0 else True)
                else:
                    L.append(False)
            return L

        for term in c:
            # no x -> x^0
            if "x" not in term:
                __add_term_n(0, int(term))
            # autodetect ** or ^ for power
            elif "**" in term:
                coefx, power = [x.strip() for x in term.split("**", 2)]
                coef, _ = coefx.split("x", 2)
                coef = coef.strip().replace("*", "")
                # if no power, then assume x == x^1; if no coef, then assume x^k == 1 * x^k
                __add_term_n(int(power) if power else 1, 1 if not coef else int(coef))
            elif "^" in term:
                coefx, power = [x.strip() for x in term.split("^", 2)]
                coef, _ = coefx.split("x", 2)
                coef = coef.strip().replace("*", "")
                # if no power, then assume x == x^1; if no coef, then assume x^k == 1 * x^k
                __add_term_n(int(power) if power else 1, 1 if not coef else int(coef))
            # assume 8x5 -> 8 * x ** 5
            else:
                coef, power = [x.strip().replace("*", "") for x in term.split("x", 2)]
                # if no power, then assume x == x^1; if no coef, then assume x^k == 1 * x^k
                __add_term_n(int(power) if power else 1, 1 if not coef else int(coef))
        return __dict_to_list()
    except ValueError:
        raise ValueError("Invalid format for input: " + s)


def _parse_list(c: list) -> list:
    """
    Convert list of coefficients to boolean if necessary, validate existing lists.
    :param c: list to convert or validate
    :return: converted list
    :raises ValueError: if coefficients are of unrecognized type
    """
    L = c.copy()
    for i in range(len(L)):
        # convert to mod 2 space if we have a generic polynomial coefficient list
        if isinstance(L[i], int):
            L[i] = False if L[i] == 0 else True
        elif not isinstance(L[i], bool):
            raise ValueError("Invalid list of coefficients")
    return L


steps = []


class Polynomial(object):
    def __init__(
            self,
            b: str = None,
            s: str = None,
            L: list = None,
            mod: object = None,
            expand_to_mod: bool = False,
    ) -> None:
        """
        Creates a new mod 2 coefficient polynomial object. The polynomial is pre-initialized with a value if
        exclusively one of b, s, or L are specified; otherwise, it is blank. If working under a field is desired, then
        a polynomial mod can be explicitly defined using mod, or a field degree GF(2^n) can be specified.
        Can also assume working in a field for appropriately sized polynomials and try to guess the field.

        The internal representation of a polynomial object is a boolean list p with increasing index representing
        increasing powers. For example, self.p[25]=True corresponds to x ** 25, whereas self.p[25]=False does not
        represent x ** 25.
        :param b: a binary string to be interpreted as a polynomial in binary form. increasing bit significance
        represents increasing power.
        :param s: a string representing a polynomial. many different formats are accepted, check
        __parse_string(str) for more details
        :param L: a list representing polynomial coefficients. The list needs to be arranged by increasing coefficients
        which can either be binary or integral.
        :param mod: a polynomial object representing a field to perform operations under. this parameter might be
        guessed based on the value of other parameters.
        :param expand_to_mod: if true, the polynomial's internal representation expands to the highest permissible
        power in the field it is contained in (e.g. len(self.p)=8 for GF(2^8)). this affects certain operations as well
        as representations, such as the bin(p) function.
        """
        self.p = []
        if b:
            self.p = _parse_bin(b)
        elif s:
            self.p = _parse_string(s)
        elif L:
            self.p = _parse_list(L)
        self.mod = mod
        k = len(self)
        # predefined mod polynomial
        if self.mod:
            if not isinstance(self.mod, Polynomial):
                raise ValueError("Modulo polynomial must be a polynomial")
            # perform mod from the start if the polynomial is too long
            if k >= len(self.mod):
                self.__mod__(self.mod, inplace=True)
            if expand_to_mod:
                self.expand()
            if k >= len(self.mod):
                self.__mod__(self.mod, inplace=True)
            if expand_to_mod:
                self.expand()

    @property
    def highest_power(self, step=False) -> int:
        """
        It is essential to use such a function when expansion in fields is possible.
        :return: highest power of this polynomial
        """
        for i in range(len(self) - 1, -1, -1):
            if self[i]:
                if step:
                    steps.append(("Find highest power of " + str(self), str(i)))
                return i
        if step:
            steps.append(("Find highest power of " + str(self), "0"))
        return 0

    def trim(self, length: int = None) -> None:
        """
        Clips a polynomial at a given length.
        If a length is not given the polynomial is clipped at the minimum representation.
        :param length: length to clip at
        """
        if length:
            # delete all entries larger than the desired size
            for i in range(len(self) - 1, length - 1, -1):
                del self[i]
        else:
            i = len(self) - 1
            # delete all false entries before the first true (i.e., the highest power)
            while i and not self[i]:
                del self[i]

    def expand(self, length: int = None) -> None:
        """
        Expands a polynomial to a given length by appending false to its representation.
        If a length is not given the polynomial is expanded until the limit of its mod space.
        :param length: length to expand to
        """
        k = len(self)
        if length is not None and length >= k:
            self.p.extend([False] * (length - k + 1))
        elif self.mod is not None:
            self.p.extend([False] * (self.mod.highest_power - k + 1))

    def bin(self) -> str:
        """
        Converts polynomial to binary string without trimming
        :return: string representing polynomial
        """
        L = ["1" if x else "0" for x in self[::-1]]
        val = "0b" + "".join(L)
        steps.append(("Convert " + str(self) + " to binary", val))
        return val

    def copy(self):
        """
        Copies a polynomial
        :return: polynomial copy from self.p list
        """
        return Polynomial(L=self.p.copy(), mod=self.mod)

    def __add__(
            self, other: object, inplace: bool = False, mod: bool = True, step=True
    ) -> object:
        """
        Performs the addition self + other.
        :param other: the other polynomial to add to self
        :param inplace: if true (invoked using self.__add__(other, inplace=True)), this function does not
        return a new polynomial but modifies the existing one instead.
        :param mod: if false, then removes mod field restriction from output polynomial
        :return: self+other as a new polynomial, unless inplace is true
        """
        # addition is same as XOR
        val = self.__xor__(other, inplace, mod, step=False)
        if step:
            steps.append(
                ("Perform XOR of " + str(self) + " and " + str(other), str(val))
            )
        return val

    def __sub__(
            self, other: object, inplace: bool = False, mod: bool = True, step=True
    ) -> object:
        """
        Performs the subtraction self - other.
        :param other: the other polynomial to subtract from self
        :param inplace: if true (invoked using self.__sub__(other, inplace=True)), this function does not
        return a new polynomial but modifies the existing one instead.
        :param mod: if false, then removes mod field restriction from output polynomial
        :return: self-other as a new polynomial, unless inplace is true
        """
        # subtraction is same as addition in mod 2 coefficient space
        val = self.__add__(other, inplace, mod, step=False)
        if step:
            steps.append(
                ("Perform XOR of " + str(self) + " and " + str(other), str(val))
            )
        return val

    def __mul__(
            self, other: object, inplace: bool = False, mod: bool = True, step=True
    ) -> object:
        """
        Performs the multiplication self * other.
        :param other: the other polynomial to multiply with self
        :param inplace: if true (invoked using self.__mul__(other, inplace=True)), this function does not
        return a new polynomial but modifies the existing one instead.
        :param mod: if false, then removes mod field restriction from output polynomial
        :return: self*other as a new polynomial, unless inplace is true
        """
        if not isinstance(other, Polynomial):
            raise ValueError("Can only multiply two polynomials")
        if mod:
            c = Polynomial(mod=self.mod)
        # start with an unrestricted output polynomial if no mod field
        else:
            c = Polynomial()
        # if self is an empty polynomial, the result is an empty polynomial
        if len(self) == 0:
            return c
        # if other contains "1", then start with that
        if other[0]:
            c += self
        # find the factor mod the field polynomial
        # e.g. x8 mod x8 + x4 + x3 + x + 1 = x4 + x3 + x + 1
        # to do that, simply create a new polynomial with the factor and the mod polynomial set
        # modulo reduction is automatically performed
        fact = None
        mx = 0
        if mod and self.mod is not None and isinstance(self.mod, Polynomial):
            # mx represents the highest possible power of the field polynomial
            mx = self.mod.highest_power
            fact = Polynomial(s="x**" + str(mx), mod=self.mod)
            if step:
                steps.append(
                    (
                        "Find factor polynomial for multiplication: x**"
                        + str(mx)
                        + " mod irreducible polynomial",
                        str(fact),
                    )
                )
        # start with x, x**2, until x**mx, adding each step along the way
        calc_steps = [self.copy()]
        for i in range(1, other.highest_power + 1):
            # to multiply by x, is to left shift by 1
            # disable mod restriction to check for overflow
            calc_steps.append(calc_steps[i - 1].__lshift__(1, mod=False))
            # if overflow in field detected
            if mod and self.mod is not None and calc_steps[i][mx]:
                # replace x**mx by its reduced form and add it to the current step
                del calc_steps[i][mx]
                calc_steps[i].trim(len(self))
                calc_steps[i] += fact
            # if the current step is a part of the other polynomial, add it to the steps list
            if other[i]:
                c += calc_steps[i]
        # handle inplace as appropriate
        steps.append(("End up with " + str(self) + " * " + str(other), str(c)))
        if not inplace:
            return c
        else:
            self.p = c.p

    def __truediv__(
            self, other: object, inplace: bool = False, mod: bool = True, step=True
    ) -> object:
        """
        Performs the division self / other.
        :param other: the other polynomial to divide self by
        :param inplace: if true (invoked using self.__truediv__(other, inplace=True)), this function does not
        return a new polynomial but modifies the existing one instead.
        :param mod: if false, then removes mod field restriction from output polynomial
        :return: self/other as a new polynomial, unless inplace is true
        """
        if not isinstance(other, Polynomial):
            raise ValueError("Can only divide two polynomials")
        if mod and self.mod:
            q = Polynomial(mod=self.mod)
        # start with an unrestricted output polynomial if no mod field
        else:
            q = Polynomial()
        d = self.copy()
        # perform long division
        # first, determine how much bigger is the dividend from the divisor
        r = d.highest_power - other.highest_power
        if step:
            steps.append(("Find difference in highest powers", str(r)))
        while r >= 0:
            # shift the divisor to match the dividend
            k = other.__lshift__(r, mod=False)
            # subtract the divisor
            d -= k
            c = [False] * r
            c.append(True)
            # add x**r to the quotient
            q += Polynomial(L=c)
            # repeat
            r = d.highest_power - other.highest_power
            if step:
                steps.append(("Find difference in highest powers", str(r)))
        # d is the mod remainder
        # handle inplace as appropriate
        if step:
            steps.append(
                ("End up with " + str(self) + " / " + str(other), str(q.copy()))
            )
        if not inplace:
            return q
        else:
            self.p = q.p

    def __invert__(self, inplace: bool = False, step=True) -> object:
        """
        Performs the inverse of self mod (self.mod), i.e. ~self, using extended Euclidean algorithm.
        :param inplace: if true (invoked using self.__invert__(inplace=True)), this function does not
        return a new polynomial but modifies the existing one instead.
        :return: ~self as a new polynomial, unless inplace is true
        """
        # if no mod field then just return the same polynomial
        if not self.mod:
            return self.copy()
        # perform extended Euclidean
        A1, A2, A3 = (
            Polynomial(L=[True], mod=self.mod),
            Polynomial(mod=self.mod),
            self.mod.copy(),
        )
        B1, B2, B3 = (
            Polynomial(mod=self.mod),
            Polynomial(L=[True], mod=self.mod),
            self.copy(),
        )
        if step:
            steps.append(("Initialize A1", str(A1)))
            steps.append(("Initialize A2", str(A2)))
            steps.append(("Initialize A3", str(A3)))
            steps.append(("Initialize B1", str(B1)))
            steps.append(("Initialize B2", str(B2)))
            steps.append(("Initialize B3", str(B3)))
        while B3.highest_power > 0:
            Q = A3 / B3
            A1, A2, A3, B1, B2, B3 = (
                B1,
                B2,
                B3,
                A1 - (Q * B1),
                A2 - (Q * B2),
                A3 - (Q * B3),
            )
        if step:
            steps.append(("Update A1", str(A1)))
            steps.append(("Update A2", str(A2)))
            steps.append(("Update A3", str(A3)))
            steps.append(("Update B1", str(B1)))
            steps.append(("Update B2", str(B2)))
            steps.append(("Update B3", str(B3)))
        # keep until B3 is 0 or 1
        # if 1, then B2 is ~self
        steps.append(("End up with inverse of " + str(self), str(B2)))
        if B3[0]:
            return B2
        # else, no inv
        else:
            raise ValueError("No inverse for given polynomial modulo defined modulus")

    def __mod__(
            self, other: object, inplace: bool = False, mod: bool = True, step=True
    ) -> object:
        """
        Performs the modulus self mod other, i.e. self % other. By default, if self does not have a field
        specified, assume that other is its new field (unless mod is false).
        :param other: the other polynomial to find self mod by
        :param inplace: if true (invoked using self.__mod__(other, inplace=True)), this function does not
        return a new polynomial but modifies the existing one instead.
        :param mod: if false, will not attempt to update field of self with other
        :return: self % other as a new polynomial, unless inplace is true
        """
        if not isinstance(other, Polynomial):
            raise ValueError("Can only reduce a polynomial modulo another polynomial")
        # perform division to find remainder in dividend
        dividend = self
        divisor = other
        while dividend.highest_power >= divisor.highest_power:
            shift = dividend.highest_power - divisor.highest_power
            shifted_divisor = divisor.__lshift__(shift, mod=False)
            dividend = dividend.__add__(shifted_divisor, mod=False)
        if step:
            steps.append(
                (
                    "End up with Mod of "
                    + str(self)
                    + " with respect to "
                    + str(other),
                    str(dividend),
                )
            )
        # update field with other
        if mod and self.mod is None:
            self.mod = other
        # handle inplace as appropriate
        if not inplace:
            return dividend
        else:
            self.p = dividend.p

    """
        Performs the AND of two polynomials.
        Returns a new polynomial.
    """

    def __and__(self, other: object, inplace: bool = False, mod: bool = True) -> object:
        """
        Performs the AND self & other, assuming binary representation of both. If one of them is longer than the other,
        then expand to fit the longer one.
        :param other: the other polynomial to AND self with
        :param inplace: if true (invoked using self.__and__(other, inplace=True)), this function does not
        return a new polynomial but modifies the existing one instead.
        :param mod: if false, then removes mod field restriction from output polynomial
        :return: self & other as a new polynomial, unless inplace is true
        """
        if not isinstance(other, Polynomial):
            raise ValueError("Can only AND two polynomials")
        c = []
        low = min(len(self), len(other))
        # do and on each, unless expansion is required
        for i in range(max(len(self), len(other))):
            if i >= low:
                c.append(False)
            else:
                c.append(self[i] and other[i])
        # handle returning + mod cases
        return self.__ret__mod(c, inplace, mod)

    def __or__(self, other: object, inplace: bool = False, mod: bool = True) -> object:
        """
        Performs the OR self | other, assuming binary representation of both. If one of them is longer than the other,
        then expand to fit the longer one.
        :param other: the other polynomial to OR self with
        :param inplace: if true (invoked using self.__or__(other, inplace=True)), this function does not
        return a new polynomial but modifies the existing one instead.
        :param mod: if false, then removes mod field restriction from output polynomial
        :return: self | other as a new polynomial, unless inplace is true
        """
        if not isinstance(other, Polynomial):
            raise ValueError("Can only OR two polynomials")
        c = []
        low = min(len(self), len(other))
        # do or on each, unless expansion is required, then feed from longer one
        for i in range(max(len(self), len(other))):
            if i >= low:
                if len(self) < len(other):
                    c.append(other[i])
                else:
                    c.append(self[i])
            else:
                c.append(self[i] or other[i])
        # handle returning + mod cases
        return self.__ret__mod(c, inplace, mod)

    def __xor__(
            self, other: object, inplace: bool = False, mod: bool = True, step=True
    ) -> object:
        """
        Performs the XOR self ^ other, assuming binary representation of both. If one of them is longer than the other,
        then expand to fit the longer one.
        :param other: the other polynomial to XOR self with
        :param inplace: if true (invoked using self.__xor__(other, inplace=True)), this function does not
        return a new polynomial but modifies the existing one instead.
        :param mod: if false, then removes mod field restriction from output polynomial
        :return: self ^ other as a new polynomial, unless inplace is true
        """
        if not isinstance(other, Polynomial):
            raise ValueError("Can only XOR two polynomials")
        c = []
        low = min(len(self), len(other))
        # do xor on each, unless expansion is required, then feed from longer one
        for i in range(max(len(self), len(other))):
            if i >= low:
                if len(self) < len(other):
                    c.append(other[i])
                else:
                    c.append(self[i])
            else:
                c.append(self[i] ^ other[i])
        if step:
            steps.append(
                (
                    "Find XOR of " + str(self) + " and " + str(other),
                    str(Polynomial(L=c)),
                )
            )
        # handle returning + mod cases
        return self.__ret__mod(c, inplace, mod)

    """
        Shifts a polynomial to the left.
        Returns a new polynomial.
    """

    def __lshift__(self, other: int, inplace: bool = False, mod: bool = True) -> object:
        """
        Performs the LSHIFT self << other on the binary representation of self assuming other is an integer.
        If one of them is longer than the other, then expand to fit the longer one.
        :param other: the integer to LSHIFT self to
        :param inplace: if true (invoked using self.__lshift__(other, inplace=True)), this function does not
        return a new polynomial but modifies the existing one instead.
        :param mod: if false, then removes mod field restriction from output polynomial
        :return: self << other as a new polynomial, unless inplace is true
        """
        if not isinstance(other, int):
            raise ValueError("Can only shift a polynomial by integer value")
        # start with zeroes "false"
        c = [False] * other
        # append the original polynomial
        c.extend(self.p)
        # handle returning + mod cases
        steps.append(("Shift " + str(self) + " by " + str(other), str(Polynomial(L=c))))
        return self.__ret__mod(c, inplace, mod)

    def __ret__mod(self, c: list, inplace: bool = False, mod: bool = True) -> object:
        """
        Handles returning from a set of common functions given a list representing a polynomial object.
        :param c: list to convert to polynomial
        :param inplace: whether to modify the current polynomial or return a new one
        :param mod: whether to perform mod on this operation
        :return: converted polynomial if not inplace
        """
        if not inplace:
            if mod and self.mod is not None:
                return Polynomial(L=c, mod=self.mod)
            else:
                return Polynomial(L=c)
        else:
            self.p = c
            # only perform mod if we end up with a polynomial larger than the mod polynomial
            if mod and self.mod is not None and len(self.p) >= self.mod.highest_power:
                self.__mod__(self.mod, True)

    def __str__(self) -> str:
        """
        Convert polynomial to str
        :return: str representing polynomial, e.g. "x ** 5 + x ** 2 + 1"
        """
        if len(self) == 0 or (self.highest_power == 0 and not self[0]):
            return "0"
        L = ["1"] if self[0] else []
        if len(self) > 1 and self[1]:
            L.append("x")
        for i in range(2, len(self)):
            if self[i]:
                L.append("x ** " + str(i))
        return " + ".join(L[::-1])

    def __iter__(self) -> list:
        """
        Converts polynomial to iterable (for list(P)) to work
        :return: list self.p
        """
        return self.p.copy()

    def __index__(self) -> int:
        """
        Convert polynomial to numeric value
        :return: int representing polynomial
        """
        L = ["1" if x else "0" for x in self[::-1]]
        val = int("0b" + "".join(L), 2)
        steps.append(("Find integer representation of " + str(self), val))
        return val

    def __len__(self) -> int:
        """
        Returns polynomial length
        :return: len(self.p)
        """
        return len(self.p)

    def __copy__(self):
        """
        Copies a polynomial (for copy(P) to work)
        :return: polynomial copy from self.p list
        """
        return self.copy()

    def __getitem__(self, i):
        """
        Allows for array access operator on a polynomial by accessing self.p directly
        If an index larger than the polynomial is specified, then the polynomial is expanded
        """
        if isinstance(i, int):
            if i >= len(self):
                self.expand(i)
            return self.p[i]
        elif isinstance(i, slice):
            if i.start and i.stop and i.start >= i.stop:
                return []
            if i.stop and i.stop >= len(self):
                self.expand(i.stop)
            return self.p[i.start: i.stop: i.step]
        else:
            raise ValueError("Can only get at an integer index or a slice")

    def __setitem__(self, i, val):
        """
        Allows for array access operator on a polynomial by accessing self.p directly
        If an index larger than the polynomial is specified, then the polynomial is expanded
        """
        if isinstance(i, int):
            if i >= len(self):
                self.expand(i)
            if not isinstance(val, bool):
                raise ValueError("Coefficient can only be a boolean")
            self.p[i] = val
        elif isinstance(i, slice):
            if i.start and i.stop and i.start >= i.stop:
                return
            if i.stop and i.stop >= len(self):
                self.expand(i.stop)
            for k in val:
                if not isinstance(k, bool):
                    raise ValueError("Coefficient can only be a boolean")
            self.p[i.start: i.stop: i.step] = val
        else:
            raise ValueError("Can only set at an integer index or a slice")

    def __delitem__(self, i):
        """
        Allows for delete operator on a polynomial by accessing self.p directly
        Trims if the specified index is the last of the polynomial list
        """
        self.p[i] = False
        if i + 1 == len(self):
            del self.p[i]


# test cases
if __name__ == "__main__":
    P1 = Polynomial(s="X6+x4+x2+x+1", mod=Polynomial(s="x8+x4+x3+x+1"))  # x**5 + x**4 + 1
    P2 = Polynomial(s="x7+x+1", mod=Polynomial(s="x8+x4+x3+x+1"))
    print(P1 * P2)
